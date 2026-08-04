package handlers

import (
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/dandychux/blue_nomad/internal/services"
)

// ShopHandler serves catalog data and processes payments via Square.
type ShopHandler struct {
	square *services.SquareClient
}

type productFeed struct {
	XMLName  xml.Name      `xml:"products"`
	Products []feedProduct `xml:"product"`
}

type feedProduct struct {
	ID          string `xml:"id"`
	Name        string `xml:"name"`
	Description string `xml:"description,omitempty"`
	Price       string `xml:"price,omitempty"`
	Currency    string `xml:"currency,omitempty"`
	URL         string `xml:"url"`
	ImageURL    string `xml:"image_url,omitempty"`
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

// GetProductFeed dynamically generates the public XML product feed.
func (h *ShopHandler) GetProductFeed(w http.ResponseWriter, r *http.Request) {
	data, err := h.square.GetCatalogItems(r.Context())
	if err != nil {
		slog.Error("failed to fetch square catalog for product feed", "error", err)
		http.Error(w, "Failed to generate product feed", http.StatusBadGateway)
		return
	}

	var catalog struct {
		Objects []struct {
			Type     string `json:"type"`
			ID       string `json:"id"`
			ItemData struct {
				Name             string `json:"name"`
				Description      string `json:"description"`
				ProductType      string `json:"product_type"`
				ImageIDs         []string `json:"image_ids"`
				Variations       []struct {
					ID         string `json:"id"`
					ItemVariationData struct {
						Name string `json:"name"`
						PriceMoney struct {
							Amount   int64  `json:"amount"`
							Currency string `json:"currency"`
						} `json:"price_money"`
					} `json:"item_variation_data"`
				} `json:"variations"`
			} `json:"item_data"`
		} `json:"objects"`
	}

	if err := json.Unmarshal(data, &catalog); err != nil {
		slog.Error("failed to decode square catalog for product feed", "error", err)
		http.Error(w, "Failed to generate product feed", http.StatusInternalServerError)
		return
	}

	baseURL := os.Getenv("PUBLIC_SITE_URL")
	if baseURL == "" {
		baseURL = requestBaseURL(r)
	}
	baseURL = strings.TrimRight(baseURL, "/")

	feed := productFeed{
		Products: make([]feedProduct, 0, len(catalog.Objects)),
	}

	for _, object := range catalog.Objects {
		if object.Type != "ITEM" || object.ItemData.ProductType == "APPOINTMENTS_SERVICE" {
			continue
		}

		product := feedProduct{
			ID:          object.ID,
			Name:        object.ItemData.Name,
			Description: object.ItemData.Description,
			URL:         baseURL + "/shop",
		}

		if len(object.ItemData.Variations) > 0 {
			variation := object.ItemData.Variations[0]
			price := variation.ItemVariationData.PriceMoney

			product.Price = fmt.Sprintf("%.2f", float64(price.Amount)/100)
			product.Currency = price.Currency
		}

		if len(object.ItemData.ImageIDs) > 0 {
			product.ImageURL = baseURL + "/api/shop/images/" +
				url.PathEscape(object.ItemData.ImageIDs[0])
		}

		feed.Products = append(feed.Products, product)
	}

	output, err := xml.MarshalIndent(feed, "", "  ")
	if err != nil {
		slog.Error("failed to encode product feed", "error", err)
		http.Error(w, "Failed to generate product feed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=300")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(xml.Header))
	_, _ = w.Write(output)
}

func requestBaseURL(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}

	if forwardedProto := r.Header.Get("X-Forwarded-Proto"); forwardedProto != "" {
		scheme = strings.TrimSpace(strings.Split(forwardedProto, ",")[0])
	}

	host := r.Host
	if forwardedHost := r.Header.Get("X-Forwarded-Host"); forwardedHost != "" {
		host = strings.TrimSpace(strings.Split(forwardedHost, ",")[0])
	}

	return scheme + "://" + host
}
