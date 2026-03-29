package services

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
)

// const (
// 	squareBaseURL = os.Getenv("SQUARE_BASE_URL")
// 	squareVersion = "2026-01-22"
// )

// SwuareClient wraps HTTP calls to the Square REST API
type SquareClient struct {
	http       *HTTPClient
	locationID string
}

type PaymentRequest struct {
	SourceID string `json:"source_id"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
}

// CheckoutItem represents an item from the frontend cart
type CheckoutItem struct {
	ID       string `json:"id"`
	Quantity int    `json:"quantity"`
}

// CheckoutRequest represents the payload from the SvelteKit frontend
type CheckoutRequest struct {
	Items []CheckoutItem `json:"items"`
}

// NewSquareClient initializes a new Square API client
func NewSquareClient(accessToken, version string) *SquareClient {
	baseURL := os.Getenv("SQUARE_BASE_URL")
	locationID := os.Getenv("SQUARE_LOCATION_ID")

	client := NewHTTPClientWithConfig(HTTPClientConfig{
		BaseURL:    baseURL,
		Timeout:    15 * time.Second,
		RetryCount: 1,
		RetryDelay: 500 * time.Millisecond,
		Headers: map[string]string{
			"Content-Type":   "application/json",
			"Square-Version": version,
		},
	})

	if accessToken != "" {
		client.SetBearerToken(accessToken)
	}

	return &SquareClient{
		http:       client,
		locationID: locationID,
	}
}

// GetCatalogItems fetches all items, categories, and images from the Square catalog.
// It handles pagination to ensure no objects are left behind on subsequent pages.
func (s *SquareClient) GetCatalogItems(ctx context.Context) (json.RawMessage, error) {
	var allObjects []interface{}
	var cursor string

	// Loop until Square stops returning a cursor
	for {
		queryParams := map[string]string{
			"types": "ITEM,CATEGORY,IMAGE",
		}

		// If we have a cursor from a previous page, add it to the query
		if cursor != "" {
			queryParams["cursor"] = cursor
		}

		resp, err := s.http.Get(ctx, "/v2/catalog/list", queryParams)
		if err != nil {
			return nil, fmt.Errorf("square catalog query failed: %w", err)
		}

		// Parse just enough of the response to grab the objects and the next cursor
		var page struct {
			Objects []interface{} `json:"objects"`
			Cursor  string        `json:"cursor"`
		}

		if err := json.Unmarshal(resp.Body, &page); err != nil {
			return nil, fmt.Errorf("failed to parse catalog page: %w", err)
		}

		// Append this page's objects to our master list
		allObjects = append(allObjects, page.Objects...)

		// If the cursor is empty, we've hit the last page! Break the loop.
		if page.Cursor == "" {
			break
		}
		cursor = page.Cursor
	}

	// Package everything back into the exact JSON shape SvelteKit is expecting
	finalResponse := map[string]interface{}{
		"objects": allObjects,
	}

	finalJSON, err := json.Marshal(finalResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to re-marshal combined catalog: %w", err)
	}

	return finalJSON, nil
}

// ProcessPayment sends a payment request to Square.
func (s *SquareClient) ProcessPayment(ctx context.Context, req PaymentRequest) (json.RawMessage, error) {
	// Construct the payload Square expects
	squarePayload := map[string]interface{}{
		"source_id":       req.SourceID,
		"idempotency_key": generateIdempotencyKey(),
		"amount_money": map[string]interface{}{
			"amount":   req.Amount,
			"currency": req.Currency,
		},
	}

	payloadBytes, err := json.Marshal(squarePayload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode square payment payload: %w", err)
	}

	resp, err := s.http.Post(ctx, "/v2/payments", payloadBytes)
	if err != nil {
		return nil, fmt.Errorf("square payment processing failed: %w", err)
	}

	// Return the raw response back to the caller
	return resp.Body, nil
}

// Add this to your SquareClient
func (s *SquareClient) CreatePaymentLink(ctx context.Context, cartData CheckoutRequest) (string, error) {
	// 1. Build Square's expected Line Items array
	var lineItems []map[string]interface{}
	for _, item := range cartData.Items {
		lineItems = append(lineItems, map[string]interface{}{
			"catalog_object_id": item.ID,
			// Square specifically requires quantity to be a string!
			"quantity": strconv.Itoa(item.Quantity),
		})
	}

	// 2. Construct the CreatePaymentLink payload
	payload := map[string]interface{}{
		// Idempotency key prevents double-charging if the network hiccups
		"idempotency_key": uuid.New().String(),
		"order": map[string]interface{}{
			"location_id": s.locationID,
			"line_items":  lineItems,
		},
		// Optional: Where to send them after they pay successfully
		"checkout_options": map[string]interface{}{
			"redirect_url": "https://bluenomad.com/shop/success",
		},
	}

	bodyBytes, _ := json.Marshal(payload)

	// 3. Make the POST request to Square
	resp, err := s.http.Post(ctx, "/v2/online-checkout/payment-links", bytes.NewReader(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("square api error: %w", err)
	}

	// 4. Parse the response to extract the long URL
	var result struct {
		PaymentLink struct {
			URL string `json:"url"`
		} `json:"payment_link"`
	}

	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return "", fmt.Errorf("failed to decode square payment link response: %w", err)
	}

	if result.PaymentLink.URL == "" {
		return "", fmt.Errorf("square did not return a payment link url")
	}

	return result.PaymentLink.URL, nil
}

// --- Helper Functions ---

// generateIdempotencyKey creates a random 32-character hex string.
// Square requires this to prevent accidental double-charges on retries.
func generateIdempotencyKey() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback for extremely rare rand failure
		return fmt.Sprintf("%d_%d", time.Now().UnixNano(), os.Getpid())
	}
	return hex.EncodeToString(bytes)
}
