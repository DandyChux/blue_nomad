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
	"strings"
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

type SquarePayment struct {
	ID           string `json:"id"`
	Status       string `json:"status"`
	OrderID      string `json:"order_id"`
	ReferenceID  string `json:"reference_id"`
	CustomerID   string `json:"customer_id"`
	VersionToken string `json:"version_token"`
	AmountMoney  struct {
		Amount   int64  `json:"amount"`
		Currency string `json:"currency"`
	} `json:"amount_money"`
}

type AuthorizeSquareBookingPaymentRequest struct {
	BookingRequestID  string
	SourceID          string
	VerificationToken string
	CustomerID        string
	PriceCents        int64
	Currency          string
	EmailAddress      string
	PhoneNumber       string
	ServiceName       string
	StartAt           time.Time
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
	raw, err := s.fetchCatalogTypes(ctx, "ITEM,CATEGORY,IMAGE")
	if err != nil {
		return nil, err
	}

	var page struct {
		Objects []json.RawMessage `json:"objects"`
	}
	if err := json.Unmarshal(raw, &page); err != nil {
		return nil, err
	}

	filtered := make([]json.RawMessage, 0, len(page.Objects))
	for _, obj := range page.Objects {
		// Peek just enough to decide whether it's an appointment service.
		var probe struct {
			Type     string `json:"type"`
			ItemData struct {
				ProductType string `json:"product_type"`
			} `json:"item_data"`
		}
		if err := json.Unmarshal(obj, &probe); err != nil {
			// If we can't even parse the type, keep it — let the UI deal.
			filtered = append(filtered, obj)
			continue
		}
		if probe.Type == "ITEM" && probe.ItemData.ProductType == "APPOINTMENTS_SERVICE" {
			continue
		}
		filtered = append(filtered, obj)
	}

	return json.Marshal(map[string]any{"objects": filtered})
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

// --- Inventory ---

// InventoryCount represents a single variation's available quantity at a location.
type InventoryCount struct {
	CatalogObjectID string `json:"catalog_object_id"`
	State           string `json:"state"`
	LocationID      string `json:"location_id"`
	Quantity        string `json:"quantity"`
}

// GetInventoryCounts fetches IN_STOCK counts for the given catalog variation IDs
// at this client's configured location. Returns a map of variation ID -> qty.
// Variations that Square does not inventory-track will simply be absent from the map.
func (s *SquareClient) GetInventoryCounts(ctx context.Context, variationIDs []string) (map[string]int64, error) {
	counts := make(map[string]int64, len(variationIDs))
	if len(variationIDs) == 0 {
		return counts, nil
	}

	payload := map[string]interface{}{
		"catalog_object_ids": variationIDs,
		"location_ids":       []string{s.locationID},
		"states":             []string{"IN_STOCK"},
	}
	bodyBytes, _ := json.Marshal(payload)

	resp, err := s.http.Post(ctx, "/v2/inventory/counts/batch-retrieve", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("inventory lookup failed: %w", err)
	}

	var result struct {
		Counts []InventoryCount `json:"counts"`
	}
	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return nil, fmt.Errorf("failed to decode inventory response: %w", err)
	}

	for _, c := range result.Counts {
		if c.State != "IN_STOCK" {
			continue
		}
		qty, err := strconv.ParseInt(c.Quantity, 10, 64)
		if err != nil {
			continue
		}
		// If the same object appears more than once, keep the higher count for this location.
		if existing, ok := counts[c.CatalogObjectID]; !ok || qty > existing {
			counts[c.CatalogObjectID] = qty
		}
	}

	return counts, nil
}

// InsufficientStockError is returned when the cart requests more than what's
// available in Square's inventory for at least one line item.
type InsufficientStockError struct {
	VariationID string
	Requested   int
	Available   int64
}

func (e *InsufficientStockError) Error() string {
	return fmt.Sprintf("insufficient stock for variation %s: requested %d, available %d",
		e.VariationID, e.Requested, e.Available)
}

// CreatePaymentLink validates inventory, then creates a Square hosted checkout link
// for the given cart. Returns *InsufficientStockError if any line exceeds available stock.
func (s *SquareClient) CreatePaymentLink(ctx context.Context, cartData CheckoutRequest) (string, error) {
	if len(cartData.Items) == 0 {
		return "", fmt.Errorf("cart is empty")
	}

	// Collapse duplicate variations and collect IDs for inventory lookup
	merged := make(map[string]int, len(cartData.Items))
	order := make([]string, 0, len(cartData.Items))
	for _, item := range cartData.Items {
		if item.ID == "" || item.Quantity <= 0 {
			continue
		}
		if _, seen := merged[item.ID]; !seen {
			order = append(order, item.ID)
		}
		merged[item.ID] += item.Quantity
	}
	if len(merged) == 0 {
		return "", fmt.Errorf("cart contains no valid items")
	}

	// Inventory check. Variations missing from the response are assumed
	// untracked (service items, digital goods, etc.) and allowed through.
	counts, err := s.GetInventoryCounts(ctx, order)
	if err != nil {
		return "", err
	}
	for _, id := range order {
		requested := merged[id]
		if available, tracked := counts[id]; tracked {
			if int64(requested) > available {
				return "", &InsufficientStockError{
					VariationID: id,
					Requested:   requested,
					Available:   available,
				}
			}
		}
	}

	// Build Square's expected Line Items array
	lineItems := make([]map[string]interface{}, 0, len(order))
	for _, id := range order {
		lineItems = append(lineItems, map[string]interface{}{
			"catalog_object_id": id,
			"quantity":          strconv.Itoa(merged[id]),
		})
	}

	// Construct the CreatePaymentLink payload
	pickupNote := "Pickup only at Blue Nomad, 1123 Broadway, #1014, New York, NY 10010. We'll contact you with pickup instructions after your oder is placed."

	payload := map[string]interface{}{
		// Idempotency key prevents double-charging if the network hiccups
		"idempotency_key": uuid.New().String(),
		"order": map[string]interface{}{
			"location_id": s.locationID,
			"line_items":  lineItems,
			"pricing_options": map[string]interface{}{
				"auto_apply_taxes":     true,
				"auto_apply_discounts": true,
			},
			"fulfillments": []map[string]interface{}{
				{
					"type":  "PICKUP",
					"state": "PROPOSED",
					"pickup_details": map[string]interface{}{
						"schedule_type": "ASAP",
						"note":          pickupNote,
					},
				},
			},
		},
		"checkout_options": map[string]interface{}{
			"redirect_url":             "https://bluenomadworld.com/shop/success",
			"ask_for_shipping_address": false,
			"merchant_support_email":   notificationEmail(),
		},
		"payment_note": "Blue Nomad order – pickup only",
	}

	bodyBytes, _ := json.Marshal(payload)

	resp, err := s.http.Post(ctx, "/v2/online-checkout/payment-links", bytes.NewReader(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("square api error: %w", err)
	}

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

type SquareAppointmentSegment struct {
	DurationMinutes         int    `json:"duration_minutes"`
	ServiceVariationID      string `json:"service_variation_id"`
	TeamMemberID            string `json:"team_member_id"`
	ServiceVariationVersion int64  `json:"service_variation_version"`
}

type SquareBooking struct {
	ID                  string                     `json:"id"`
	Version             int                        `json:"version"`
	Status              string                     `json:"status"`
	CreatedAt           string                     `json:"created_at"`
	UpdatedAt           string                     `json:"updated_at"`
	StartAt             string                     `json:"start_at"`
	LocationID          string                     `json:"location_id"`
	CustomerID          string                     `json:"customer_id"`
	AppointmentSegments []SquareAppointmentSegment `json:"appointment_segments"`
}

type SquareOrder struct {
	ID          string `json:"id"`
	LocationID  string `json:"location_id"`
	ReferenceID string `json:"reference_id"`
}

func (s *SquareClient) GetOrder(ctx context.Context, orderID string) (*SquareOrder, error) {
	if orderID == "" {
		return nil, fmt.Errorf("order id is required")
	}

	resp, err := s.http.Get(ctx, "/v2/orders/"+orderID, nil)
	if err != nil {
		return nil, fmt.Errorf("retrieve order failed: %w", err)
	}

	var result struct {
		Order SquareOrder `json:"order"`
	}
	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return nil, fmt.Errorf("failed to decode order: %w", err)
	}
	if result.Order.ID == "" {
		return nil, fmt.Errorf("square returned empty order for id %s", orderID)
	}

	return &result.Order, nil
}

func (s *SquareClient) GetBooking(ctx context.Context, bookingID string) (*SquareBooking, error) {
	if bookingID == "" {
		return nil, fmt.Errorf("booking id is required")
	}

	resp, err := s.http.Get(ctx, "/v2/bookings/"+bookingID, nil)
	if err != nil {
		return nil, fmt.Errorf("retrieve booking failed: %w", err)
	}

	var result struct {
		Booking SquareBooking `json:"booking"`
	}
	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return nil, fmt.Errorf("failed to decode booking: %w", err)
	}
	if result.Booking.ID == "" {
		return nil, fmt.Errorf("square returned empty booking for id %s", bookingID)
	}

	return &result.Booking, nil
}

func (s *SquareClient) CreateBookingCustomer(ctx context.Context, req CreateBookingRequest) (string, error) {
	customerPayload := map[string]interface{}{
		"idempotency_key": generateIdempotencyKey(),
		"given_name":      req.GivenName,
		"family_name":     req.FamilyName,
		"email_address":   req.EmailAddress,
		"phone_number":    req.PhoneNumber,
	}

	resp, err := s.http.Post(ctx, "/v2/customers", customerPayload)
	if err != nil {
		return "", fmt.Errorf("customer creation failed: %w", err)
	}

	var result struct {
		Customer struct {
			ID string `json:"id"`
		} `json:"customer"`
	}
	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return "", fmt.Errorf("decode customer creation response: %w", err)
	}
	if result.Customer.ID == "" {
		return "", fmt.Errorf("square did not return a customer id")
	}

	return result.Customer.ID, nil
}

func (s *SquareClient) AuthorizeBookingPayment(ctx context.Context, req AuthorizeSquareBookingPaymentRequest) (*SquarePayment, error) {
	payload := map[string]interface{}{
		"source_id":       req.SourceID,
		"idempotency_key": generateIdempotencyKey(),
		"autocomplete":    false,
		"delay_action":    "CANCEL",
		"amount_money": map[string]interface{}{
			"amount":   req.PriceCents,
			"currency": req.Currency,
		},
		"location_id":         s.locationID,
		"reference_id":        uuid.New().String(),
		"buyer_email_address": req.EmailAddress,
		"buyer_phone_number":  req.PhoneNumber,
		"note":                fmt.Sprintf("Blue Nomad booking request for %s", req.ServiceName),
	}

	if req.CustomerID != "" {
		payload["customer_id"] = req.CustomerID
	}
	if req.VerificationToken != "" {
		payload["verification_token"] = req.VerificationToken
	}

	resp, err := s.http.Post(ctx, "/v2/payments", payload)
	if err != nil {
		return nil, fmt.Errorf("square payment authorization failed: %w", err)
	}

	var result struct {
		Payment SquarePayment `json:"payment"`
	}
	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return nil, fmt.Errorf("decode square payment authorization response: %w", err)
	}
	if result.Payment.ID == "" {
		return nil, fmt.Errorf("square did not return a payment id")
	}

	return &result.Payment, nil
}

func (s *SquareClient) CancelPayment(ctx context.Context, paymentID string) error {
	if paymentID == "" {
		return fmt.Errorf("payment id is required")
	}

	_, err := s.http.Post(ctx, "/v2/payments/"+paymentID+"/cancel", map[string]any{})
	if err != nil {
		return fmt.Errorf("cancel payment failed: %w", err)
	}

	return nil
}

func (s *SquareClient) CreateBookingOnly(ctx context.Context, requestID string, req CreateBookingRequest, customerID string) (*SquareBooking, error) {
	bookingPayload := map[string]interface{}{
		"idempotency_key": fmt.Sprintf("bk:%s", requestID),
		"booking": map[string]interface{}{
			"start_at":    req.StartAt,
			"location_id": s.locationID,
			"customer_id": customerID,
			"appointment_segments": []map[string]interface{}{
				{
					"service_variation_id":      req.ServiceVariationID,
					"team_member_id":            req.TeamMemberID,
					"service_variation_version": req.ServiceVariationVersion,
				},
			},
		},
	}

	resp, err := s.http.Post(ctx, "/v2/bookings", bookingPayload)
	if err != nil {
		return nil, fmt.Errorf("booking creation failed: %w", err)
	}

	var result struct {
		Booking SquareBooking `json:"booking"`
	}
	if err := json.Unmarshal(resp.Body, &result); err != nil {
		return nil, fmt.Errorf("decode booking creation response: %w", err)
	}
	if result.Booking.ID == "" {
		return nil, fmt.Errorf("square did not return a booking id")
	}

	return &result.Booking, nil
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

func normalizeUSPhone(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}

	// Keep leading + if present, strip other non-digits
	if strings.HasPrefix(raw, "+") {
		digits := "+"
		for _, r := range raw[1:] {
			if r >= '0' && r <= '9' {
				digits += string(r)
			}
		}
		if len(digits) >= 10 && len(digits) <= 16 {
			return digits
		}
		return ""
	}

	// Strip non-digits
	digits := make([]rune, 0, len(raw))
	for _, r := range raw {
		if r >= '0' && r <= '9' {
			digits = append(digits, r)
		}
	}

	// Assume US numbers when 10 digits are entered
	if len(digits) == 10 {
		return "+1" + string(digits)
	}

	// Allow US 11-digit numbers starting with 1
	if len(digits) == 11 && digits[0] == '1' {
		return "+" + string(digits)
	}

	return ""
}

func notificationEmail() string {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail != "" {
		return adminEmail
	}
	return os.Getenv("EMAIL_USERNAME")
}
