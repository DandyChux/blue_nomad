package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/dandychux/blue_nomad/internal/services"
)

// BookingHandler manages the headless appointment flow
type BookingHandler struct {
	square *services.SquareClient
}

func NewBookingHandler(square *services.SquareClient) *BookingHandler {
	return &BookingHandler{square: square}
}

// GetServices returns all APPOINTMENTS_SERVICE catalog objects
func (h *BookingHandler) GetServices(w http.ResponseWriter, r *http.Request) {
	data, err := h.square.GetBookingServices(r.Context())
	if err != nil {
		slog.Error("failed to fetch booking services", "error", err)
		http.Error(w, "Failed to fetch services", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// GetAvailability checks for open slots for a specific service and date range
func (h *BookingHandler) GetAvailability(w http.ResponseWriter, r *http.Request) {
	var req services.SearchAvailabilityRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Warn("invalid availability request body", "error", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validation: Ensure we have a service ID and a start time
	if req.ServiceVariationID == "" || req.StartAt == "" {
		http.Error(w, "Missing service_variation_id or start_at", http.StatusBadRequest)
		return
	}

	data, err := h.square.SearchAvailability(r.Context(), req)
	if err != nil {
		slog.Error("failed to search square availability", "error", err)
		http.Error(w, "Failed to check availability", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// CreateBooking handles the final submission: Customer creation + Appointment booking
func (h *BookingHandler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	var req services.CreateBookingRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Warn("invalid create booking request body", "error", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Basic Validation
	if req.ServiceVariationID == "" || req.StartAt == "" || req.EmailAddress == "" {
		http.Error(w, "Missing required booking details", http.StatusBadRequest)
		return
	}

	err := h.square.CreateBooking(r.Context(), req)
	if err != nil {
		slog.Error("failed to finalize square booking", "error", err)
		// We return a 422 if it's likely a business logic error (slot taken, etc)
		// or 502 if Square is down.
		http.Error(w, "Could not complete booking", http.StatusUnprocessableEntity)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Booking confirmed",
	})
}
