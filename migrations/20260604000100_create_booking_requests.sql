-- +goose Up
CREATE TABLE booking_requests (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL
        CHECK (status IN (
            'pending_payment',
            'payment_authorized',
            'booking_created',
            'booking_failed',
            'payment_canceled'
        )),

    service_variation_id TEXT NOT NULL,
    team_member_id TEXT NOT NULL,
    service_variation_version BIGINT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,

    given_name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    email_address TEXT NOT NULL,
    phone_number TEXT,
    service_name TEXT NOT NULL,
    price_cents BIGINT NOT NULL CHECK (price_cents > 0),
    currency TEXT NOT NULL DEFAULT 'USD',

    square_customer_id TEXT,
    square_payment_id TEXT UNIQUE,
    square_payment_status TEXT,
    square_payment_order_id TEXT,
    square_booking_id TEXT UNIQUE,
    square_booking_status TEXT,
    square_card_id TEXT,

    payment_authorized_at TIMESTAMPTZ,
    booking_created_at TIMESTAMPTZ,
    admin_notified_at TIMESTAMPTZ,

    failure_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_requests_status_created_at
    ON booking_requests (status, created_at);

CREATE INDEX idx_booking_requests_start_at
    ON booking_requests (start_at);

CREATE INDEX idx_booking_requests_email
    ON booking_requests (email_address);

-- +goose Down
DROP TABLE IF EXISTS booking_requests;
DROP INDEX IF EXISTS idx_booking_requests_status_created_at;
DROP INDEX IF EXISTS idx_booking_requests_start_at;
DROP INDEX IF EXISTS idx_booking_requests_email;
