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

// SearchAvailabilityRequest for headless booking
type SearchAvailabilityRequest struct {
	ServiceVariationID string `json:"service_variation_id"`
	StartAt            string `json:"start_at"`
	EndAt              string `json:"end_at"`
}

// CreateBookingRequest for headless booking
type CreateBookingRequest struct {
	ServiceVariationID      string `json:"service_variation_id"`
	TeamMemberID            string `json:"team_member_id"`
	ServiceVariationVersion int64  `json:"service_variation_version"`
	StartAt                 string `json:"start_at"`
	GivenName               string `json:"given_name"`
	FamilyName              string `json:"family_name"`
	EmailAddress            string `json:"email_address"`
	PhoneNumber             string `json:"phone_number"`
	ServiceName             string `json:"service_name"`
	PriceCents              int64  `json:"price_cents"`
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

func (s *SquareClient) GetCatalogItems(ctx context.Context) (json.RawMessage, error) {
	return s.fetchCatalogTypes(ctx, "ITEM,CATEGORY,IMAGE")
}

// GetBookingServices fetches all appointment services from the catalog
func (s *SquareClient) GetBookingServices(ctx context.Context) (json.RawMessage, error) {
	return s.fetchCatalogTypes(ctx, "ITEM,IMAGE")
}

// Internal helper to handle Square's catalog pagination
func (s *SquareClient) fetchCatalogTypes(ctx context.Context, types string) (json.RawMessage, error) {
	var allObjects []interface{}
	var cursor string

	for {
		queryParams := map[string]string{"types": types}
		if cursor != "" {
			queryParams["cursor"] = cursor
		}

		resp, err := s.http.Get(ctx, "/v2/catalog/list", queryParams)
		if err != nil {
			return nil, err
		}

		var page struct {
			Objects []interface{} `json:"objects"`
			Cursor  string        `json:"cursor"`
		}

		if err := json.Unmarshal(resp.Body, &page); err != nil {
			return nil, err
		}

		allObjects = append(allObjects, page.Objects...)
		if page.Cursor == "" {
			break
		}
		cursor = page.Cursor
	}

	finalResponse := map[string]interface{}{"objects": allObjects}
	return json.Marshal(finalResponse)
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

// --- Booking Methods ---

// SearchAvailability queries Square for open slots
func (s *SquareClient) SearchAvailability(ctx context.Context, req SearchAvailabilityRequest) (json.RawMessage, error) {
	payload := map[string]interface{}{
		"query": map[string]interface{}{
			"filter": map[string]interface{}{
				"start_at_range": map[string]interface{}{
					"start_at": req.StartAt,
					"end_at":   req.EndAt,
				},
				"location_id": s.locationID,
				"segment_filters": []map[string]interface{}{
					{"service_variation_id": req.ServiceVariationID},
				},
			},
		},
	}

	payloadBytes, _ := json.Marshal(payload)
	resp, err := s.http.Post(ctx, "/v2/bookings/availability/search", bytes.NewReader(payloadBytes))
	if err != nil {
		return nil, err
	}

	return resp.Body, nil
}

// BookingResult contains the data returned after a successful booking + checkout creation
type BookingResult struct {
	BookingID   string `json:"booking_id"`
	CheckoutURL string `json:"checkout_url"`
}

// CreateBooking creates a customer, reserves the appointment, and generates a
// Square-hosted checkout link for prepayment — mirroring the shop checkout flow.
func (s *SquareClient) CreateBooking(ctx context.Context, req CreateBookingRequest) (*BookingResult, error) {
	// 1. Create/Find Customer
	customerPayload := map[string]interface{}{
		"idempotency_key": generateIdempotencyKey(),
		"given_name":      req.GivenName,
		"family_name":     req.FamilyName,
		"email_address":   req.EmailAddress,
		"phone_number":    req.PhoneNumber,
	}

	custBytes, _ := json.Marshal(customerPayload)
	custResp, err := s.http.Post(ctx, "/v2/customers", bytes.NewReader(custBytes))
	if err != nil {
		return nil, fmt.Errorf("customer creation failed: %w", err)
	}

	var custResult struct {
		Customer struct {
			ID string `json:"id"`
		} `json:"customer"`
	}
	json.Unmarshal(custResp.Body, &custResult)

	// 2. Create Booking (reserves the time slot)
	bookingPayload := map[string]interface{}{
		"idempotency_key": generateIdempotencyKey(),
		"booking": map[string]interface{}{
			"start_at":    req.StartAt,
			"location_id": s.locationID,
			"customer_id": custResult.Customer.ID,
			"appointment_segments": []map[string]interface{}{
				{
					"service_variation_id":      req.ServiceVariationID,
					"team_member_id":            req.TeamMemberID,
					"service_variation_version": req.ServiceVariationVersion,
				},
			},
		},
	}

	bookBytes, _ := json.Marshal(bookingPayload)
	bookResp, err := s.http.Post(ctx, "/v2/bookings", bytes.NewReader(bookBytes))
	if err != nil {
		return nil, fmt.Errorf("booking creation failed: %w", err)
	}

	var bookResult struct {
		Booking struct {
			ID string `json:"id"`
		} `json:"booking"`
	}
	json.Unmarshal(bookResp.Body, &bookResult)

	// 3. Create a Square-hosted checkout link for prepayment
	checkoutURL, err := s.createBookingCheckoutLink(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("checkout link creation failed: %w", err)
	}

	return &BookingResult{
		BookingID:   bookResult.Booking.ID,
		CheckoutURL: checkoutURL,
	}, nil
}

// createBookingCheckoutLink generates a Square payment link for a booking.
// Uses an ad-hoc line item (service name + price) since APPOINTMENTS_SERVICE
// catalog items may not be orderable through the checkout API.
func (s *SquareClient) createBookingCheckoutLink(ctx context.Context, req CreateBookingRequest) (string, error) {
	payload := map[string]interface{}{
		"idempotency_key": uuid.New().String(),
		"order": map[string]interface{}{
			"location_id": s.locationID,
			"line_items": []map[string]interface{}{
				{
					"name":     req.ServiceName,
					"quantity": "1",
					"base_price_money": map[string]interface{}{
						"amount":   req.PriceCents,
						"currency": "USD",
					},
				},
			},
		},
		"checkout_options": map[string]interface{}{
			"redirect_url": "https://bluenomad.com/booking/confirmed",
		},
	}

	bodyBytes, _ := json.Marshal(payload)
	resp, err := s.http.Post(ctx, "/v2/online-checkout/payment-links", bytes.NewReader(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("square checkout link error: %w", err)
	}

	var result struct {
		PaymentLink struct {
			URL string `json:"url"`
		} `json:"payment_link"`
	}

	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return "", fmt.Errorf("failed to decode checkout link response: %w", err)
	}

	if result.PaymentLink.URL == "" {
		return "", fmt.Errorf("square did not return a checkout url")
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
