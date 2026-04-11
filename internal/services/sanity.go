package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"sync"
	"time"
)

// SanityClient wraps HTTP calls to the Sanity Content Lake API.
type SanityClient struct {
	http      *HTTPClient
	projectID string
	dataset   string

	mu    sync.RWMutex
	cache map[string]cacheEntry
}

type cacheEntry struct {
	data      json.RawMessage
	expiresAt time.Time
}

func NewSanityClient(projectID, dataset, apiVersion, token string) *SanityClient {
	baseURL := fmt.Sprintf("https://%s.api.sanity.io/v%s", projectID, apiVersion)

	client := NewHTTPClientWithConfig(HTTPClientConfig{
		BaseURL:    baseURL,
		Timeout:    10 * time.Second,
		RetryCount: 2,
		RetryDelay: 500 * time.Millisecond,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	})

	if token != "" {
		client.SetBearerToken(token)
	}

	return &SanityClient{
		http:      client,
		projectID: projectID,
		dataset:   dataset,
		cache:     make(map[string]cacheEntry),
	}
}

// Query executes a GROQ query against the Sanity Content Lake.
func (s *SanityClient) Query(ctx context.Context, groq string, params map[string]string) (json.RawMessage, error) {
	qp := map[string]string{
		"query": groq,
	}
	for k, v := range params {
		qp["$"+k] = fmt.Sprintf("%q", v)
	}

	resp, err := s.http.Get(ctx, "/data/query/"+s.dataset, qp)
	if err != nil {
		return nil, fmt.Errorf("sanity query failed: %w", err)
	}

	// Sanity wraps results in { "ms": ..., "query": ..., "result": ... }
	var envelope struct {
		Result json.RawMessage `json:"result"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return nil, fmt.Errorf("failed to decode sanity response: %w", err)
	}

	return envelope.Result, nil
}

// QueryCached runs a GROQ query with a TTL-based in-memory cache.
func (s *SanityClient) QueryCached(ctx context.Context, cacheKey, groq string, params map[string]string, ttl time.Duration) (json.RawMessage, error) {
	// Check cache
	s.mu.RLock()
	if entry, ok := s.cache[cacheKey]; ok && time.Now().Before(entry.expiresAt) {
		s.mu.RUnlock()
		return entry.data, nil
	}
	s.mu.RUnlock()

	// Cache miss — fetch from Sanity
	data, err := s.Query(ctx, groq, params)
	if err != nil {
		return nil, err
	}

	// Store in cache
	s.mu.Lock()
	s.cache[cacheKey] = cacheEntry{data: data, expiresAt: time.Now().Add(ttl)}
	s.mu.Unlock()

	return data, nil
}

// InvalidateCache clears all cached queries. Called by the webhook handler.
func (s *SanityClient) InvalidateCache() {
	s.mu.Lock()
	s.cache = make(map[string]cacheEntry)
	s.mu.Unlock()
}

// ImageURL builds a Sanity CDN image URL from an asset reference.
//
//	ref format: "image-<id>-<width>x<height>-<format>"
//	output:     "https://cdn.sanity.io/images/<projectId>/<dataset>/<id>-<width>x<height>.<format>"
func (s *SanityClient) ImageURL(ref string, queryParams map[string]string) string {
	// Parse ref: "image-abc123-800x600-png" → "abc123-800x600.png"
	// Strip "image-" prefix, replace last "-" with "."
	if len(ref) < 7 {
		return ""
	}
	stripped := ref[6:] // remove "image-"
	lastDash := len(stripped) - 1
	for i := len(stripped) - 1; i >= 0; i-- {
		if stripped[i] == '-' {
			lastDash = i
			break
		}
	}
	filename := stripped[:lastDash] + "." + stripped[lastDash+1:]

	base := fmt.Sprintf("https://cdn.sanity.io/images/%s/%s/%s", s.projectID, s.dataset, filename)

	if len(queryParams) > 0 {
		v := url.Values{}
		for k, val := range queryParams {
			v.Set(k, val)
		}
		return base + "?" + v.Encode()
	}
	return base
}
