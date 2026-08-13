-- +goose Up

ALTER TABLE booking_requests
DROP CONSTRAINT booking_requests_price_cents_check;

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_price_cents_check
CHECK (price_cents >= 0);

-- +goose Down

ALTER TABLE booking_requests
DROP CONSTRAINT booking_requests_price_cents_check;

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_price_cents_check
CHECK (price_cents > 0);
