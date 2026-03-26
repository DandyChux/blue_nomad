package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// HTTPClient is a wrapper around http.Client with additional functionality
type HTTPClient struct {
	client     *http.Client
	BaseURL    string
	Headers    map[string]string
	Timeout    time.Duration
	RetryCount int
	RetryDelay time.Duration
}

// HTTPClientConfig holds configuration for creating a new HTTP client
type HTTPClientConfig struct {
	BaseURL    string
	Timeout    time.Duration
	RetryCount int
	RetryDelay time.Duration
	Headers    map[string]string
}

// HTTPResponse represents a standardized HTTP response
type HTTPResponse struct {
	StatusCode  int
	Headers     http.Header
	Body        []byte
	RawResponse *http.Response
}

// NewHTTPClient creates a new HTTP client with default configuration
func NewHTTPClient() *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		Headers:    make(map[string]string),
		Timeout:    30 * time.Second,
		RetryCount: 3,
		RetryDelay: 1 * time.Second,
	}
}

// NewHTTPClientWithConfig creates a new HTTP client with custom configuration
func NewHTTPClientWithConfig(config HTTPClientConfig) *HTTPClient {
	timeout := config.Timeout
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	retryCount := config.RetryCount
	if retryCount == 0 {
		retryCount = 3
	}

	retryDelay := config.RetryDelay
	if retryDelay == 0 {
		retryDelay = 1 * time.Second
	}

	headers := config.Headers
	if headers == nil {
		headers = make(map[string]string)
	}

	return &HTTPClient{
		client: &http.Client{
			Timeout: timeout,
		},
		BaseURL:    strings.TrimRight(config.BaseURL, "/"),
		Headers:    headers,
		Timeout:    timeout,
		RetryCount: retryCount,
		RetryDelay: retryDelay,
	}
}

// SetHeader sets a default header for all requests
func (c *HTTPClient) SetHeader(key, value string) {
	c.Headers[key] = value
}

// SetBearerToken sets the Authorization header with a bearer token
func (c *HTTPClient) SetBearerToken(token string) {
	c.SetHeader("Authorization", fmt.Sprintf("Bearer %s", token))
}

// SetBasicAuth sets the Authorization header with basic auth
func (c *HTTPClient) SetBasicAuth(username, password string) {
	auth := fmt.Sprintf("%s:%s", username, password)
	encoded := base64Encode([]byte(auth))
	c.SetHeader("Authorization", fmt.Sprintf("Basic %s", encoded))
}

// Get performs a GET request
func (c *HTTPClient) Get(ctx context.Context, path string, queryParams map[string]string) (*HTTPResponse, error) {
	return c.Request(ctx, "GET", path, queryParams, nil, nil)
}

// Post performs a POST request with JSON body
func (c *HTTPClient) Post(ctx context.Context, path string, body interface{}) (*HTTPResponse, error) {
	return c.Request(ctx, "POST", path, nil, body, nil)
}

// Put performs a PUT request with JSON body
func (c *HTTPClient) Put(ctx context.Context, path string, body interface{}) (*HTTPResponse, error) {
	return c.Request(ctx, "PUT", path, nil, body, nil)
}

// Patch performs a PATCH request with JSON body
func (c *HTTPClient) Patch(ctx context.Context, path string, body interface{}) (*HTTPResponse, error) {
	return c.Request(ctx, "PATCH", path, nil, body, nil)
}

// Delete performs a DELETE request
func (c *HTTPClient) Delete(ctx context.Context, path string) (*HTTPResponse, error) {
	return c.Request(ctx, "DELETE", path, nil, nil, nil)
}

// PostForm performs a POST request with form data
func (c *HTTPClient) PostForm(ctx context.Context, path string, formData map[string]string) (*HTTPResponse, error) {
	form := url.Values{}
	for k, v := range formData {
		form.Set(k, v)
	}

	headers := map[string]string{
		"Content-Type": "application/x-www-form-urlencoded",
	}

	return c.Request(ctx, "POST", path, nil, strings.NewReader(form.Encode()), headers)
}

// Request performs a generic HTTP request with retry logic
func (c *HTTPClient) Request(ctx context.Context, method, path string, queryParams map[string]string, body interface{}, headers map[string]string) (*HTTPResponse, error) {
	var lastErr error

	for attempt := 0; attempt <= c.RetryCount; attempt++ {
		if attempt > 0 {
			// Wait before retrying
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(c.RetryDelay * time.Duration(attempt)):
			}
		}

		resp, err := c.doRequest(ctx, method, path, queryParams, body, headers)
		if err == nil {
			return resp, nil
		}

		lastErr = err

		// Don't retry on client errors (4xx) or if context is cancelled
		if resp != nil && resp.StatusCode >= 400 && resp.StatusCode < 500 {
			return resp, err
		}

		if ctx.Err() != nil {
			return nil, ctx.Err()
		}
	}

	return nil, fmt.Errorf("request failed after %d attempts: %w", c.RetryCount+1, lastErr)
}

// doRequest performs a single HTTP request
func (c *HTTPClient) doRequest(ctx context.Context, method, path string, queryParams map[string]string, body interface{}, headers map[string]string) (*HTTPResponse, error) {
	// Build URL
	fullURL := c.buildURL(path, queryParams)

	// Prepare body
	var bodyReader io.Reader
	if body != nil {
		switch v := body.(type) {
		case io.Reader:
			bodyReader = v
		case []byte:
			bodyReader = bytes.NewReader(v)
		case string:
			bodyReader = strings.NewReader(v)
		default:
			// Assume JSON serializable
			jsonData, err := json.Marshal(body)
			if err != nil {
				return nil, fmt.Errorf("failed to marshal request body: %w", err)
			}
			bodyReader = bytes.NewReader(jsonData)
		}
	}

	// Create request
	req, err := http.NewRequestWithContext(ctx, method, fullURL, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set default headers
	for k, v := range c.Headers {
		req.Header.Set(k, v)
	}

	// Set request-specific headers
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	// Set Content-Type for JSON if not already set and body is not a reader/string
	if body != nil && req.Header.Get("Content-Type") == "" {
		if _, ok := body.(io.Reader); !ok {
			if _, ok := body.(string); !ok {
				req.Header.Set("Content-Type", "application/json")
			}
		}
	}

	// Perform request
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return &HTTPResponse{
			StatusCode:  resp.StatusCode,
			Headers:     resp.Header,
			RawResponse: resp,
		}, fmt.Errorf("failed to read response body: %w", err)
	}

	httpResp := &HTTPResponse{
		StatusCode:  resp.StatusCode,
		Headers:     resp.Header,
		Body:        respBody,
		RawResponse: resp,
	}

	// Check for HTTP errors
	if resp.StatusCode >= 400 {
		return httpResp, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	return httpResp, nil
}

// buildURL constructs the full URL with base URL, path, and query parameters
func (c *HTTPClient) buildURL(path string, queryParams map[string]string) string {
	fullURL := path

	// Add base URL if path is relative
	if c.BaseURL != "" && !strings.HasPrefix(path, "http://") && !strings.HasPrefix(path, "https://") {
		fullURL = c.BaseURL + "/" + strings.TrimLeft(path, "/")
	}

	// Add query parameters
	if len(queryParams) > 0 {
		params := url.Values{}
		for k, v := range queryParams {
			params.Set(k, v)
		}
		separator := "?"
		if strings.Contains(fullURL, "?") {
			separator = "&"
		}
		fullURL += separator + params.Encode()
	}

	return fullURL
}

// JSON parses the response body as JSON
func (r *HTTPResponse) JSON(v interface{}) error {
	if err := json.Unmarshal(r.Body, v); err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	return nil
}

// String returns the response body as a string
func (r *HTTPResponse) String() string {
	return string(r.Body)
}

// IsSuccess returns true if the status code is 2xx
func (r *HTTPResponse) IsSuccess() bool {
	return r.StatusCode >= 200 && r.StatusCode < 300
}

// Helper function for base64 encoding (simplified for basic auth)
func base64Encode(data []byte) string {
	const base64Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	result := make([]byte, ((len(data)+2)/3)*4)

	j := 0
	for i := 0; i < len(data); i += 3 {
		var b0, b1, b2 byte
		b0 = data[i]
		if i+1 < len(data) {
			b1 = data[i+1]
		}
		if i+2 < len(data) {
			b2 = data[i+2]
		}

		result[j] = base64Table[b0>>2]
		result[j+1] = base64Table[((b0&0x03)<<4)|(b1>>4)]

		if i+1 < len(data) {
			result[j+2] = base64Table[((b1&0x0f)<<2)|(b2>>6)]
		} else {
			result[j+2] = '='
		}

		if i+2 < len(data) {
			result[j+3] = base64Table[b2&0x3f]
		} else {
			result[j+3] = '='
		}

		j += 4
	}

	return string(result)
}
