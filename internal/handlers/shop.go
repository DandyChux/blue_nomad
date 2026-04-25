package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/dandychux/blue_nomad/internal/services"
)

// ShopHandler serves catalog data and processes payments via Square.
type ShopHandler struct {
	square *services.SquareClient
}

func NewShopHandler(square *services.SquareClient) *ShopHandler {
	return &ShopHandler{square: square}
}

// GetCatalog returns all items from the Square catalog.
func (h *ShopHandler) GetCatalog(w http.ResponseWriter, r *http.Request) {
	data, err := h.square.GetCatalogItems(r.Context())
	if err != nil {
		slog.Error("failed to fetch square catalog", "error", err)
		http.Error(w, "Failed to fetch catalog", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// CreateCheckoutLink handles incoming cart payloads and returns a Square hosted checkout URL.
func (h *ShopHandler) CreateCheckoutLink(w http.ResponseWriter, r *http.Request) {
	var req services.CheckoutRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Warn("invalid checkout request body", "error", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if len(req.Items) == 0 {
		http.Error(w, "Cart is empty", http.StatusBadRequest)
		return
	}

	// Call the Square service to generate the link
	checkoutURL, err := h.square.CreatePaymentLink(r.Context(), req)
	if err != nil {
		var stockErr *services.InsufficientStockError
		if errors.As(err, &stockErr) {
			slog.Info("checkout blocked by inventory",
				"variation_id", stockErr.VariationID,
				"requested", stockErr.Requested,
				"available", stockErr.Available,
			)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]any{
				"error":        "insufficient_stock",
				"message":      "One or more items in your bag are no longer available in the quantity requested.",
				"variation_id": stockErr.VariationID,
				"requested":    stockErr.Requested,
				"available":    stockErr.Available,
			})
			return
		}

		slog.Error("failed to create square payment link", "error", err)
		http.Error(w, "Checkout initialization failed", http.StatusBadGateway)
		return
	}

	// Return the URL as JSON so SvelteKit can redirect the user
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": checkoutURL,
	})
}
