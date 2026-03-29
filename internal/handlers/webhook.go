package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
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
		} `json:"object"`
	} `json:"data"`
}

type WebhookHandler struct {
	secret             string
	squareSignatureKey string // NEW: From Square Developer Dashboard
	squareWebhookURL   string // NEW: The exact URL Square is hitting (needed for validation)
	sanity             *services.SanityClient

	mu            sync.RWMutex
	lastInvalidAt time.Time
	lastEvent     string
}

// Updated Constructor
func NewWebhookHandler(secret, squareSignatureKey, squareWebhookURL string, sanity *services.SanityClient) *WebhookHandler {
	return &WebhookHandler{
		secret:             secret,
		squareSignatureKey: squareSignatureKey,
		squareWebhookURL:   squareWebhookURL,
		sanity:             sanity,
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

	switch payload.Type {
	case "payment.created", "payment.updated":
		payment := payload.Data.Object.Payment

		if payment.Status == "COMPLETED" {
			slog.Info("✅ Payment COMPLETED!",
				"payment_id", payment.ID,
				"order_id", payment.OrderID,
				"amount", payment.AmountMoney.Amount,
			)

			// --- FULFILLMENT EMAIL LOGIC ---
			adminEmail := os.Getenv("ADMIN_EMAIL")
			if adminEmail == "" {
				adminEmail = os.Getenv("EMAIL_USERNAME")
			}

			// Square amounts are in cents (e.g., 1500 = $15.00)
			formattedAmount := fmt.Sprintf("%.2f", float64(payment.AmountMoney.Amount)/100.0)

			msg := &services.EmailMessage{
				To:      []string{adminEmail},
				Subject: fmt.Sprintf("New Blue Nomad Order Paid: %s", payment.OrderID),
				BodyText: fmt.Sprintf(
					"New Order Received!\n\nOrder ID: %s\nPayment ID: %s\nAmount: $%s %s\n\nPlease check your Square Dashboard for shipping details.",
					payment.OrderID, payment.ID, formattedAmount, payment.AmountMoney.Currency,
				),
				BodyHTML: fmt.Sprintf(`
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #000; text-transform: uppercase;">New Order Received</h2>
						<p>A payment has been successfully completed via Square Checkout.</p>
						<div style="background-color: #f9fafb; padding: 20px; border-radius: 4px; margin: 20px 0;">
							<p><strong>Order ID:</strong> %s</p>
							<p><strong>Payment ID:</strong> %s</p>
							<p><strong>Total Amount:</strong> $%s %s</p>
						</div>
						<p>Log in to your <a href="https://squareup.com/dashboard/orders">Square Dashboard</a> to view the customer's shipping address and fulfill the order.</p>
					</div>
				`, payment.OrderID, payment.ID, formattedAmount, payment.AmountMoney.Currency),
			}

			// Send the email and log any errors
			if err := services.SendEmail(msg); err != nil {
				slog.Error("Failed to send fulfillment notification email", "error", err, "order_id", payment.OrderID)
			} else {
				slog.Info("Fulfillment notification sent to admin", "order_id", payment.OrderID)
			}
		}

	default:
		slog.Debug("Unhandled Square event type ignored", "type", payload.Type)
	}

	w.WriteHeader(http.StatusOK)
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
