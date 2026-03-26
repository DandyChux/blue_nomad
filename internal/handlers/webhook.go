package handlers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
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

type WebhookHandler struct {
	secret string
	sanity *services.SanityClient

	mu            sync.RWMutex
	lastInvalidAt time.Time
	lastEvent     string
}

func NewWebhookHandler(secret string, sanity *services.SanityClient) *WebhookHandler {
	return &WebhookHandler{
		secret: secret,
		sanity: sanity,
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

func describeEvent(p WebhookPayload) string {
	if p.Collection != "" && p.Event != "" {
		return fmt.Sprintf("directus:%s/%s", p.Collection, p.Event)
	}
	if p.Type != "" && p.Operation != "" {
		return fmt.Sprintf("sanity:%s/%s", p.Type, p.Operation)
	}
	return "unknown"
}
