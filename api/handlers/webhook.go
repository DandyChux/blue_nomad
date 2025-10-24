package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type WebhookPayload struct {
	Type      string `json:"_type"`
	Operation string `json:"operation"`
}

func Revalidate(w http.ResponseWriter, r *http.Request) {
	// Verify webhook secret
	secret := r.URL.Query().Get("secret")
	webhookSecret := os.Getenv("SANITY_WEBHOOK_SECRET")

	if webhookSecret == "" || secret != webhookSecret {
		http.Error(w, "Invalid secret", http.StatusUnauthorized)
		return
	}

	// Parse webhook payload
	var payload WebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Log the webhook event
	log.Printf("Webhook received: _type=%s, operation=%s", payload.Type, payload.Operation)

	// In the React app, we'll handle cache invalidation differently
	// For now, just acknowledge the webhook

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "Revalidation triggered successfully",
		"revalidated": true,
	})
}

func Health(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
