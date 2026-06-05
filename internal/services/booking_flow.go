package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
)

var ErrSlotNoLongerAvailable = errors.New("slot no longer available")

type AuthorizeBookingPaymentInput struct {
	BookingRequestID  string
	SourceID          string
	VerificationToken string
}

type ApprovedPaymentInfo struct {
	ID          string
	Status      string
	ReferenceID string
	CustomerID  string
	OrderID     string
}

type BookingFlowService struct {
	store  *BookingRequestStore
	square *SquareClient
}

func NewBookingFlowService(store *BookingRequestStore, square *SquareClient) *BookingFlowService {
	return &BookingFlowService{
		store:  store,
		square: square,
	}
}

func (s *BookingFlowService) CreateRequest(ctx context.Context, req CreateBookingRequest) (*BookingRequest, error) {
	return s.store.Create(ctx, req)
}

func (s *BookingFlowService) MarkAdminNotified(ctx context.Context, requestID string) error {
	return s.store.MarkAdminNotified(ctx, requestID)
}

func (s *BookingFlowService) AuthorizeAndBook(ctx context.Context, input AuthorizeBookingPaymentInput) (*BookingRequest, error) {
	req, err := s.store.GetByID(ctx, input.BookingRequestID)
	if err != nil {
		return nil, err
	}
	if req.Status == BookingRequestStatusBookingCreated {
		return req, nil
	}

	customerID, err := s.ensureCustomer(ctx, req)
	if err != nil {
		return nil, err
	}

	payment, err := s.square.AuthorizeBookingPayment(ctx, AuthorizeSquareBookingPaymentRequest{
		BookingRequestID:  req.ID,
		SourceID:          input.SourceID,
		VerificationToken: input.VerificationToken,
		CustomerID:        customerID,
		PriceCents:        req.PriceCents,
		Currency:          req.Currency,
		EmailAddress:      req.EmailAddress,
		PhoneNumber:       req.PhoneNumber,
		ServiceName:       req.ServiceName,
		StartAt:           req.StartAt,
	})
	if err != nil {
		return nil, fmt.Errorf("authorize booking payment: %w", err)
	}

	if payment.Status != "APPROVED" && payment.Status != "COMPLETED" {
		return nil, fmt.Errorf("unexpected booking payment status: %s", payment.Status)
	}

	if err := s.store.MarkPaymentAuthorized(ctx, req.ID, payment.ID, payment.Status, payment.OrderID); err != nil {
		return nil, err
	}

	booking, err := s.square.CreateBookingOnly(ctx, req.ID, CreateBookingRequest{
		ServiceVariationID:      req.ServiceVariationID,
		TeamMemberID:            req.TeamMemberID,
		ServiceVariationVersion: req.ServiceVariationVersion,
		StartAt:                 req.StartAt.Format(time.RFC3339),
		GivenName:               req.GivenName,
		FamilyName:              req.FamilyName,
		EmailAddress:            req.EmailAddress,
		PhoneNumber:             req.PhoneNumber,
		ServiceName:             req.ServiceName,
		PriceCents:              req.PriceCents,
	}, customerID)
	if err != nil {
		if isSquareBookingConflict(err) {
			_ = s.square.CancelPayment(ctx, payment.ID)
			_ = s.store.MarkFailed(ctx, req.ID, BookingRequestStatusPaymentCanceled, "slot no longer available after payment authorization")
			return nil, ErrSlotNoLongerAvailable
		}
		return nil, fmt.Errorf("create square booking: %w", err)
	}

	if err := s.store.MarkBookingCreated(ctx, req.ID, booking.ID, booking.Status); err != nil {
		return nil, err
	}

	return s.store.GetByID(ctx, req.ID)
}

func (s *BookingFlowService) RecoverApprovedPayment(ctx context.Context, payment ApprovedPaymentInfo) (*BookingRequest, error) {
	if payment.Status != "APPROVED" {
		return nil, nil
	}

	requestID, ok := bookingRequestIDFromReference(payment.ReferenceID)
	if !ok {
		return nil, nil
	}

	req, err := s.store.GetByID(ctx, requestID)
	if err != nil {
		return nil, err
	}

	if payment.CustomerID != "" && req.SquareCustomerID == "" {
		if err := s.store.SaveSquareCustomerID(ctx, req.ID, payment.CustomerID); err != nil {
			return nil, err
		}
		req.SquareCustomerID = payment.CustomerID
	}

	if req.SquarePaymentID == "" || req.SquarePaymentStatus != payment.Status {
		if err := s.store.MarkPaymentAuthorized(ctx, req.ID, payment.ID, payment.Status, payment.OrderID); err != nil {
			return nil, err
		}
	}

	if req.Status == BookingRequestStatusBookingCreated && req.SquareBookingID != "" {
		return s.store.GetByID(ctx, req.ID)
	}

	customerID, err := s.ensureCustomer(ctx, req)
	if err != nil {
		return nil, err
	}

	booking, err := s.square.CreateBookingOnly(ctx, req.ID, CreateBookingRequest{
		ServiceVariationID:      req.ServiceVariationID,
		TeamMemberID:            req.TeamMemberID,
		ServiceVariationVersion: req.ServiceVariationVersion,
		StartAt:                 req.StartAt.Format(time.RFC3339),
		GivenName:               req.GivenName,
		FamilyName:              req.FamilyName,
		EmailAddress:            req.EmailAddress,
		PhoneNumber:             req.PhoneNumber,
		ServiceName:             req.ServiceName,
		PriceCents:              req.PriceCents,
	}, customerID)
	if err != nil {
		if isSquareBookingConflict(err) {
			_ = s.square.CancelPayment(ctx, payment.ID)
			_ = s.store.MarkFailed(ctx, req.ID, BookingRequestStatusPaymentCanceled, "slot no longer available during webhook recovery")
			return nil, nil
		}
		return nil, fmt.Errorf("recover create square booking: %w", err)
	}

	if err := s.store.MarkBookingCreated(ctx, req.ID, booking.ID, booking.Status); err != nil {
		return nil, err
	}

	return s.store.GetByID(ctx, req.ID)
}

func (s *BookingFlowService) ensureCustomer(ctx context.Context, req *BookingRequest) (string, error) {
	if req.SquareCustomerID != "" {
		return req.SquareCustomerID, nil
	}

	customerID, err := s.square.CreateBookingCustomer(ctx, CreateBookingRequest{
		GivenName:    req.GivenName,
		FamilyName:   req.FamilyName,
		EmailAddress: req.EmailAddress,
		PhoneNumber:  req.PhoneNumber,
	})
	if err != nil {
		return "", fmt.Errorf("create square customer: %w", err)
	}

	if err := s.store.SaveSquareCustomerID(ctx, req.ID, customerID); err != nil {
		return "", err
	}

	req.SquareCustomerID = customerID
	return customerID, nil
}

func bookingRequestIDFromReference(reference string) (string, bool) {
	const prefix = "booking_request:"
	if !strings.HasPrefix(reference, prefix) {
		return "", false
	}
	id := strings.TrimPrefix(reference, prefix)
	if id == "" {
		return "", false
	}
	return id, true
}

func isSquareBookingConflict(err error) bool {
	msg := err.Error()
	return strings.Contains(msg, "HTTP 409") ||
		strings.Contains(msg, "CONFLICT") ||
		strings.Contains(msg, "already booked") ||
		strings.Contains(msg, "availability")
}
