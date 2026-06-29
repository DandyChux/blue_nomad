package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BookingRequestStatus string

const (
	BookingRequestStatusPendingPayment    BookingRequestStatus = "pending_payment"
	BookingRequestStatusPaymentAuthorized BookingRequestStatus = "payment_authorized"
	BookingRequestStatusBookingCreated    BookingRequestStatus = "booking_created"
	BookingRequestStatusBookingFailed     BookingRequestStatus = "booking_failed"
	BookingRequestStatusPaymentCanceled   BookingRequestStatus = "payment_canceled"
)

var ErrBookingRequestNotFound = errors.New("booking request not found")

type BookingRequest struct {
	ID                      string
	Status                  BookingRequestStatus
	ServiceVariationID      string
	TeamMemberID            string
	ServiceVariationVersion int64
	StartAt                 time.Time
	GivenName               string
	FamilyName              string
	EmailAddress            string
	PhoneNumber             string
	ServiceName             string
	PriceCents              int64
	Currency                string

	SquareCustomerID     string
	SquareCardID         string
	SquarePaymentID      string
	SquarePaymentStatus  string
	SquarePaymentOrderID string
	SquareBookingID      string
	SquareBookingStatus  string

	PaymentAuthorizedAt *time.Time
	BookingCreatedAt    *time.Time
	AdminNotifiedAt     *time.Time

	FailureReason string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type BookingRequestStore struct {
	db *pgxpool.Pool
}

func NewBookingRequestStore(db *pgxpool.Pool) *BookingRequestStore {
	return &BookingRequestStore{db: db}
}

func (s *BookingRequestStore) Create(ctx context.Context, req CreateBookingRequest) (*BookingRequest, error) {
	startAt, err := time.Parse(time.RFC3339, req.StartAt)
	if err != nil {
		return nil, fmt.Errorf("parse start_at: %w", err)
	}

	id := uuid.NewString()

	_, err = s.db.Exec(ctx, `
		INSERT INTO booking_requests (
			id,
			status,
			service_variation_id,
			team_member_id,
			service_variation_version,
			start_at,
			given_name,
			family_name,
			email_address,
			phone_number,
			service_name,
			price_cents,
			currency,
			created_at,
			updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'USD', NOW(), NOW()
		)
	`,
		id,
		BookingRequestStatusPendingPayment,
		req.ServiceVariationID,
		req.TeamMemberID,
		req.ServiceVariationVersion,
		startAt,
		req.GivenName,
		req.FamilyName,
		req.EmailAddress,
		req.PhoneNumber,
		req.ServiceName,
		req.PriceCents,
	)
	if err != nil {
		return nil, fmt.Errorf("insert booking request: %w", err)
	}

	return s.GetByID(ctx, id)
}

func (s *BookingRequestStore) GetByID(ctx context.Context, id string) (*BookingRequest, error) {
	row := s.db.QueryRow(ctx, `
		SELECT
			id,
			status,
			service_variation_id,
			team_member_id,
			service_variation_version,
			start_at,
			given_name,
			family_name,
			email_address,
			phone_number,
			service_name,
			price_cents,
			currency,
			square_customer_id,
			square_card_id,
			square_payment_id,
			square_payment_status,
			square_payment_order_id,
			square_booking_id,
			square_booking_status,
			payment_authorized_at,
			booking_created_at,
			admin_notified_at,
			failure_reason,
			created_at,
			updated_at
		FROM booking_requests
		WHERE id = $1
	`, id)

	req, err := scanBookingRequest(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrBookingRequestNotFound
		}
		return nil, err
	}
	return req, nil
}

func (s *BookingRequestStore) GetBySquareBookingID(ctx context.Context, bookingID string) (*BookingRequest, error) {
	row := s.db.QueryRow(ctx, `
		SELECT
			id,
			status,
			service_variation_id,
			team_member_id,
			service_variation_version,
			start_at,
			given_name,
			family_name,
			email_address,
			phone_number,
			service_name,
			price_cents,
			currency,
			square_customer_id,
			square_card_id,
			square_payment_id,
			square_payment_status,
			square_payment_order_id,
			square_booking_id,
			square_booking_status,
			payment_authorized_at,
			booking_created_at,
			admin_notified_at,
			failure_reason,
			created_at,
			updated_at
		FROM booking_requests
		WHERE square_booking_id = $1
	`, bookingID)

	req, err := scanBookingRequest(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrBookingRequestNotFound
		}
		return nil, err
	}
	return req, nil
}

func (s *BookingRequestStore) SaveSquareCustomerID(ctx context.Context, id, customerID string) error {
	_, err := s.db.Exec(ctx, `
		UPDATE booking_requests
		SET square_customer_id = $2,
		    updated_at = NOW()
		WHERE id = $1
	`, id, customerID)
	if err != nil {
		return fmt.Errorf("save square customer id: %w", err)
	}
	return nil
}

func (s *BookingRequestStore) SaveSquareCardID(ctx context.Context, id, cardID string) error {
	_, err := s.db.Exec(ctx, `
	UPDATE booking_requests
	SET square_card_id = $2,
		updated_at = NOW()
	WHERE id = $1
	`, id, cardID)
	if err != nil {
		return fmt.Errorf("save square card id: %w", err)
	}

	return nil
}

func (s *BookingRequestStore) MarkPaymentAuthorized(
	ctx context.Context,
	id, paymentID, paymentStatus, orderID string,
) error {
	_, err := s.db.Exec(ctx, `
		UPDATE booking_requests
		SET
			square_payment_id = $2,
			square_payment_status = $3,
			square_payment_order_id = $4,
			status = CASE
				WHEN status = 'booking_created' THEN status
				ELSE 'payment_authorized'
			END,
			payment_authorized_at = COALESCE(payment_authorized_at, NOW()),
			updated_at = NOW()
		WHERE id = $1
	`, id, paymentID, paymentStatus, orderID)
	if err != nil {
		return fmt.Errorf("mark payment authorized: %w", err)
	}
	return nil
}

func (s *BookingRequestStore) MarkBookingCreated(
	ctx context.Context,
	id, bookingID, bookingStatus string,
) error {
	_, err := s.db.Exec(ctx, `
		UPDATE booking_requests
		SET
			status = 'booking_created',
			square_booking_id = $2,
			square_booking_status = $3,
			booking_created_at = COALESCE(booking_created_at, NOW()),
			failure_reason = NULL,
			updated_at = NOW()
		WHERE id = $1
	`, id, bookingID, bookingStatus)
	if err != nil {
		return fmt.Errorf("mark booking created: %w", err)
	}
	return nil
}

func (s *BookingRequestStore) MarkFailed(ctx context.Context, id string, status BookingRequestStatus, reason string) error {
	_, err := s.db.Exec(ctx, `
		UPDATE booking_requests
		SET
			status = $2,
			failure_reason = $3,
			updated_at = NOW()
		WHERE id = $1
	`, id, status, reason)
	if err != nil {
		return fmt.Errorf("mark booking request failed: %w", err)
	}
	return nil
}

func (s *BookingRequestStore) MarkAdminNotified(ctx context.Context, id string) error {
	_, err := s.db.Exec(ctx, `
		UPDATE booking_requests
		SET
			admin_notified_at = NOW(),
			updated_at = NOW()
		WHERE id = $1
	`, id)
	if err != nil {
		return fmt.Errorf("mark admin notified: %w", err)
	}
	return nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanBookingRequest(row scanner) (*BookingRequest, error) {
	var req BookingRequest
	var phoneNumber sql.NullString
	var squareCustomerID sql.NullString
	var squareCardID sql.NullString
	var squarePaymentID sql.NullString
	var squarePaymentStatus sql.NullString
	var squarePaymentOrderID sql.NullString
	var squareBookingID sql.NullString
	var squareBookingStatus sql.NullString
	var failureReason sql.NullString
	var paymentAuthorizedAt sql.NullTime
	var bookingCreatedAt sql.NullTime
	var adminNotifiedAt sql.NullTime

	err := row.Scan(
		&req.ID,
		&req.Status,
		&req.ServiceVariationID,
		&req.TeamMemberID,
		&req.ServiceVariationVersion,
		&req.StartAt,
		&req.GivenName,
		&req.FamilyName,
		&req.EmailAddress,
		&phoneNumber,
		&req.ServiceName,
		&req.PriceCents,
		&req.Currency,
		&squareCustomerID,
		&squareCardID,
		&squarePaymentID,
		&squarePaymentStatus,
		&squarePaymentOrderID,
		&squareBookingID,
		&squareBookingStatus,
		&paymentAuthorizedAt,
		&bookingCreatedAt,
		&adminNotifiedAt,
		&failureReason,
		&req.CreatedAt,
		&req.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	req.PhoneNumber = phoneNumber.String
	req.SquareCustomerID = squareCustomerID.String
	req.SquareCardID = squareCardID.String
	req.SquarePaymentID = squarePaymentID.String
	req.SquarePaymentStatus = squarePaymentStatus.String
	req.SquarePaymentOrderID = squarePaymentOrderID.String
	req.SquareBookingID = squareBookingID.String
	req.SquareBookingStatus = squareBookingStatus.String
	req.FailureReason = failureReason.String

	if paymentAuthorizedAt.Valid {
		t := paymentAuthorizedAt.Time
		req.PaymentAuthorizedAt = &t
	}
	if bookingCreatedAt.Valid {
		t := bookingCreatedAt.Time
		req.BookingCreatedAt = &t
	}
	if adminNotifiedAt.Valid {
		t := adminNotifiedAt.Time
		req.AdminNotifiedAt = &t
	}

	return &req, nil
}
