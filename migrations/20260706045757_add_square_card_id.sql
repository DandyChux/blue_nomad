-- +goose Up
ALTER TABLE booking_requests ADD COLUMN square_card_id TEXT;

-- +goose Down
ALTER TABLE booking_requests DROP COLUMN square_card_id;
