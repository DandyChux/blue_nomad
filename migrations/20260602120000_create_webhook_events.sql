-- +goose Up
CREATE TABLE webhook_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'dead_letter')),

    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 12 CHECK (max_attempts > 0),

    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_started_at TIMESTAMPTZ,
    locked_by TEXT,
    last_error TEXT,
    dead_lettered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    UNIQUE (provider, event_id)
);

CREATE INDEX idx_webhook_events_ready
    ON webhook_events (provider, status, next_attempt_at, created_at);

CREATE INDEX idx_webhook_events_stale_processing
    ON webhook_events (provider, status, processing_started_at);

CREATE INDEX idx_webhook_events_event_type
    ON webhook_events (provider, event_type);

-- +goose Down
DROP TABLE IF EXISTS webhook_events;
