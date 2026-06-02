package handlers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/dandychux/blue_nomad/internal/services"
)

type WebhookPayload struct {
	Type       string `json:"_type,omitempty"`
	Operation  string `json:"operation,omitempty"`
	Event      string `json:"event,omitempty"`
	Collection string `json:"collection,omitempty"`
}

// --- Square Webhook Structs ---
type SquareWebhookPayload struct {
	MerchantID string `json:"merchant_id"`
	Type       string `json:"type"`
	EventID    string `json:"event_id"`
	Data       struct {
		Type   string `json:"type"`
		ID     string `json:"id"`
		Object struct {
			Payment struct {
				ID          string `json:"id"`
				OrderID     string `json:"order_id"`
				Status      string `json:"status"`
				AmountMoney struct {
					Amount   int64  `json:"amount"`
					Currency string `json:"currency"`
				} `json:"amount_money"`
			} `json:"payment"`
			Booking struct {
				ID                  string `json:"id"`
				Version             int    `json:"version"`
				Status              string `json:"status"`
				CreatedAt           string `json:"created_at"`
				StartAt             string `json:"start_at"`
				LocationID          string `json:"location_id"`
				CustomerID          string `json:"customer_id"`
				AppointmentSegments []struct {
					DurationMinutes         int    `json:"duration_minutes"`
					ServiceVariationID      string `json:"service_variation_id"`
					TeamMemberID            string `json:"team_member_id"`
					ServiceVariationVersion int64  `json:"service_variation_version"`
				} `json:"appointment_segments"`
			} `json:"booking"`
		} `json:"object"`
	} `json:"data"`
}

type WebhookHandler struct {
	secret             string
	squareSignatureKey string
	squareWebhookURL   string
	sanity             *services.SanityClient
	square             *services.SquareClient

	mu            sync.RWMutex
	lastInvalidAt time.Time
	lastEvent     string
}

// Updated Constructor
func NewWebhookHandler(secret, squareSignatureKey, squareWebhookURL string, sanity *services.SanityClient, square *services.SquareClient) *WebhookHandler {
	return &WebhookHandler{
		secret:             secret,
		squareSignatureKey: squareSignatureKey,
		squareWebhookURL:   squareWebhookURL,
		sanity:             sanity,
		square:             square,
	}
}

func (h *WebhookHandler) Revalidate(w http.ResponseWriter, r *http.Request) {
	secret := r.URL.Query().Get("secret")
	if h.secret == "" || secret != h.secret {
		http.Error(w, "Invalid secret", http.StatusUnauthorized)
		return
	}

	var payload WebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	event := describeEvent(payload)
	slog.Info("Webhook received — invalidating cache", "event", event)

	h.sanity.InvalidateCache()

	h.mu.Lock()
	h.lastInvalidAt = time.Now().UTC()
	h.lastEvent = event
	h.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"message":        "Revalidation triggered",
		"revalidated":    true,
		"invalidated_at": h.lastInvalidAt.Format(time.RFC3339),
	})
}

func (h *WebhookHandler) LastInvalidation(w http.ResponseWriter, r *http.Request) {
	h.mu.RLock()
	t := h.lastInvalidAt
	evt := h.lastEvent
	h.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, max-age=0")
	json.NewEncoder(w).Encode(map[string]any{
		"invalidated_at": t.Format(time.RFC3339),
		"event":          evt,
	})
}

func (h *WebhookHandler) Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// HandleSquareWebhook receives payment events from Square
func (h *WebhookHandler) HandleSquareWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		slog.Error("Failed to read Square webhook body", "error", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	signature := r.Header.Get("X-Square-Hmacsha256-Signature")
	if !h.verifySquareSignature(string(body), signature) {
		slog.Warn("Invalid Square webhook signature. Possible spoofing attempt.")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var payload SquareWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		slog.Error("Failed to unmarshal Square webhook payload", "error", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	slog.Info("Square Webhook Received", "event_type", payload.Type)

	go func() {
		switch payload.Type {
		case "payment.created":
			h.handlePaymentEvent(payload)

		case "booking.created":
			h.handleBookingCreated(payload)

		case "booking.updated":
			h.handleBookingUpdated(payload)

		default:
			slog.Debug("Unhandled Square event type ignored", "type", payload.Type)
		}
	}()

	w.WriteHeader(http.StatusOK)
}

func (h *WebhookHandler) handlePaymentEvent(payload SquareWebhookPayload) {
	payment := payload.Data.Object.Payment

	if payment.Status != "COMPLETED" {
		return
	}

	if payment.OrderID == "" {
		slog.Debug("Ignoring completed payment without order ID", "payment_id", payment.ID)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	order, err := h.square.GetOrder(ctx, payment.OrderID)
	if err != nil {
		slog.Error("Failed to retrieve Square order for payment",
			"error", err,
			"payment_id", payment.ID,
			"order_id", payment.OrderID,
		)
		return
	}

	bookingID, ok := bookingIDFromReference(order.ReferenceID)
	if !ok {
		slog.Debug("Ignoring non-booking payment",
			"payment_id", payment.ID,
			"order_id", payment.OrderID,
			"reference_id", order.ReferenceID,
		)
		return
	}

	booking, err := h.square.GetBooking(ctx, bookingID)
	if err != nil {
		slog.Error("Failed to retrieve booking for completed booking payment",
			"error", err,
			"booking_id", bookingID,
			"payment_id", payment.ID,
		)
		return
	}

	startAt, err := time.Parse(time.RFC3339, booking.StartAt)
	var formattedDate, formattedTime string
	if err == nil {
		if loc, lerr := time.LoadLocation("America/New_York"); lerr == nil {
			startAt = startAt.In(loc)
		}
		formattedDate = startAt.Format("Monday, January 2, 2006")
		formattedTime = startAt.Format("3:04 PM")
	} else {
		formattedDate = booking.StartAt
		formattedTime = ""
	}

	var durationMin int
	if len(booking.AppointmentSegments) > 0 {
		durationMin = booking.AppointmentSegments[0].DurationMinutes
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = os.Getenv("EMAIL_USERNAME")
	}
	if adminEmail == "" {
		slog.Warn("No admin email configured for booking payment notification")
		return
	}

	formattedAmount := fmt.Sprintf("%.2f", float64(payment.AmountMoney.Amount)/100.0)

	msg := &services.EmailMessage{
		To:      []string{adminEmail},
		Subject: fmt.Sprintf("New Blue Nomad Order Paid: %s", payment.OrderID),
		BodyText: fmt.Sprintf(
			"A booking payment has been completed.\n\nBooking ID: %s\nStatus: %s\nDate: %s\nTime: %s\nDuration: %d minutes\nCustomer ID: %s\nPayment ID: %s\nOrder ID: %s\nAmount: $%s %s\n\nThis appointment is still pending manual approval in Square.",
			booking.ID,
			booking.Status,
			formattedDate,
			formattedTime,
			durationMin,
			booking.CustomerID,
			payment.ID,
			payment.OrderID,
			formattedAmount,
			payment.AmountMoney.Currency,
		),
		BodyHTML: fmt.Sprintf(`
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #000; text-transform: uppercase;">Booking Paid</h2>
				<p>A client completed payment for a booking.</p>
				<div style="background-color: #f9fafb; padding: 20px; border-radius: 4px; margin: 20px 0;">
					<p><strong>Booking ID:</strong> %s</p>
					<p><strong>Status:</strong> %s</p>
					<p><strong>Date:</strong> %s</p>
					<p><strong>Time:</strong> %s</p>
					<p><strong>Duration:</strong> %d minutes</p>
					<p><strong>Customer ID:</strong> %s</p>
					<p><strong>Payment ID:</strong> %s</p>
					<p><strong>Order ID:</strong> %s</p>
					<p><strong>Total Amount:</strong> $%s %s</p>
				</div>
				<p>Payment details have been captured. This booking is awaiting manual approval in Square.</p>
				<p><a href="https://squareup.com/dashboard/appointments">Open in Square Appointments</a></p>
			</div>
		`, booking.ID, booking.Status, formattedDate, formattedTime, durationMin, booking.CustomerID, payment.ID, payment.OrderID, formattedAmount, payment.AmountMoney.Currency),
	}

	if err := services.SendEmail(msg); err != nil {
		slog.Error("Failed to send fulfillment notification email", "error", err, "booking_id", booking.ID, "payment_id", payment.ID)
		return
	}

	slog.Info("Booking payment notification sent",
		"booking_id", booking.ID,
		"payment_id", payment.ID,
		"payment_status", payment.Status,
	)
}

func (h *WebhookHandler) handleBookingCreated(payload SquareWebhookPayload) {
	booking := payload.Data.Object.Booking

	slog.Info("📅 Booking CREATED",
		"booking_id", booking.ID,
		"status", booking.Status,
		"start_at", booking.StartAt,
		"customer_id", booking.CustomerID,
	)
}

// handleBookingUpdated notifies the admin when a booking changes state
// (confirmation, cancellation, reschedule, decline, etc.). Square fires
// booking.updated for any of these transitions, so we translate the status
// into a human-readable subject line and include the full context in the body.
func (h *WebhookHandler) handleBookingUpdated(payload SquareWebhookPayload) {
	booking := payload.Data.Object.Booking

	startAt, err := time.Parse(time.RFC3339, booking.StartAt)
	var formattedDate, formattedTime string
	if err == nil {
		if loc, lerr := time.LoadLocation("America/New_York"); lerr == nil {
			startAt = startAt.In(loc)
		}
		formattedDate = startAt.Format("Monday, January 2, 2006")
		formattedTime = startAt.Format("3:04 PM")
	} else {
		formattedDate = booking.StartAt
	}

	var durationMin int
	var serviceVariationID string
	if len(booking.AppointmentSegments) > 0 {
		durationMin = booking.AppointmentSegments[0].DurationMinutes
		serviceVariationID = booking.AppointmentSegments[0].ServiceVariationID
	}

	switch booking.Status {
	case "ACCEPTED", "DECLINED", "CANCELLED_BY_CUSTOMER", "CANCELLED_BY_SELLER", "NO_SHOW":
		// Map Square's status to a friendly subject prefix
		statusLabel := bookingStatusLabel(booking.Status)

		slog.Info("📅 Booking UPDATED",
			"booking_id", booking.ID,
			"status", booking.Status,
			"version", booking.Version,
			"start_at", booking.StartAt,
			"customer_id", booking.CustomerID,
		)

		adminEmail := os.Getenv("ADMIN_EMAIL")
		if adminEmail == "" {
			adminEmail = os.Getenv("EMAIL_USERNAME")
		}

		subject := fmt.Sprintf("Booking %s: %s at %s", statusLabel, formattedDate, formattedTime)

		msg := &services.EmailMessage{
			To:      []string{adminEmail},
			Subject: subject,
			BodyText: fmt.Sprintf(
				"Booking %s\n\nBooking ID: %s\nStatus: %s\nDate: %s\nTime: %s\nDuration: %d minutes\nCustomer ID: %s\nService Variation: %s\nVersion: %d\n\nReview in your Square Dashboard for full details.",
				statusLabel, booking.ID, booking.Status, formattedDate, formattedTime,
				durationMin, booking.CustomerID, serviceVariationID, booking.Version,
			),
			BodyHTML: fmt.Sprintf(`
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #000; text-transform: uppercase;">Booking %s</h2>
					<p>An existing appointment was updated on Square.</p>
					<div style="background-color: #f9fafb; padding: 20px; border-radius: 4px; margin: 20px 0;">
						<p><strong>Date:</strong> %s</p>
						<p><strong>Time:</strong> %s</p>
						<p><strong>Duration:</strong> %d minutes</p>
						<p><strong>New Status:</strong> %s</p>
						<p><strong>Booking ID:</strong> %s</p>
						<p><strong>Version:</strong> %d</p>
					</div>
					<p><a href="https://squareup.com/dashboard/appointments">Open in Square Dashboard</a></p>
				</div>
			`, statusLabel, formattedDate, formattedTime, durationMin, booking.Status, booking.ID, booking.Version),
		}

		if err := services.SendEmail(msg); err != nil {
			slog.Error("Failed to send booking update email", "error", err, "booking_id", booking.ID)
		} else {
			slog.Info("Booking update notification sent to admin", "booking_id", booking.ID)
		}

	default:
		slog.Debug("Skipping non-final booking update", "booking_id", booking.ID, "status", booking.Status)
		return
	}
}

// bookingStatusLabel maps Square booking statuses to human-friendly text.
func bookingStatusLabel(status string) string {
	switch status {
	case "ACCEPTED":
		return "Confirmed"
	case "PENDING":
		return "Pending"
	case "DECLINED":
		return "Declined"
	case "CANCELLED_BY_CUSTOMER":
		return "Cancelled (by customer)"
	case "CANCELLED_BY_SELLER":
		return "Cancelled (by seller)"
	case "NO_SHOW":
		return "No-show"
	default:
		if status == "" {
			return "Updated"
		}
		return status
	}
}

// verifySquareSignature mathematically proves the request came from Square
func (h *WebhookHandler) verifySquareSignature(body, signature string) bool {
	if h.squareSignatureKey == "" || signature == "" {
		return false
	}

	// Square combines your Webhook URL + the raw body, and signs it with your Signature Key
	message := h.squareWebhookURL + body
	mac := hmac.New(sha256.New, []byte(h.squareSignatureKey))
	mac.Write([]byte(message))

	expectedMAC := mac.Sum(nil)
	expectedSignature := base64.StdEncoding.EncodeToString(expectedMAC)

	return expectedSignature == signature
}

func describeEvent(p WebhookPayload) string {
	if p.Collection != "" && p.Event != "" {
		return fmt.Sprintf("directus:%s/%s", p.Collection, p.Event)
	}
	if p.Type != "" && p.Operation != "" {
		return fmt.Sprintf("sanity:%s/%s", p.Type, p.Operation)
	}
	return "unknown"
}

func bookingIDFromReference(reference string) (string, bool) {
	const prefix = "booking:"
	if !strings.HasPrefix(reference, prefix) {
		return "", false
	}

	bookingID := strings.TrimPrefix(reference, prefix)
	if bookingID == "" {
		return "", false
	}

	return bookingID, true
}
