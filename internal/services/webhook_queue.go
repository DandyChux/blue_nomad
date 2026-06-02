package services

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	WebhookProviderSquare = "square"
)

type EnqueueWebhookEventParams struct {
	Provider  string
	EventID   string
	EventType string
	Payload   []byte
}

type WebhookJob struct {
	ID          int64
	Provider    string
	EventID     string
	EventType   string
	Payload     []byte
	Attempts    int
	MaxAttempts int
}

type WebhookProcessor interface {
	ProcessQueuedWebhook(ctx context.Context, provider string, payload []byte) error
}

type WebhookQueue struct {
	db *pgxpool.Pool
}

func NewWebhookQueue(db *pgxpool.Pool) *WebhookQueue {
	return &WebhookQueue{db: db}
}

func (q *WebhookQueue) Enqueue(ctx context.Context, params EnqueueWebhookEventParams) (bool, error) {
	if params.Provider == "" {
		return false, fmt.Errorf("provider is required")
	}
	if params.EventID == "" {
		return false, fmt.Errorf("event id is required")
	}
	if params.EventType == "" {
		return false, fmt.Errorf("event type is required")
	}
	if len(params.Payload) == 0 {
		return false, fmt.Errorf("payload is required")
	}

	cmd, err := q.db.Exec(ctx, `
		INSERT INTO webhook_events (
			provider,
			event_id,
			event_type,
			payload,
			status,
			attempts,
			max_attempts,
			next_attempt_at,
			created_at,
			updated_at
		) VALUES (
			$1, $2, $3, $4::jsonb, 'pending', 0, 12, NOW(), NOW(), NOW()
		)
		ON CONFLICT (provider, event_id) DO NOTHING
	`, params.Provider, params.EventID, params.EventType, string(params.Payload))
	if err != nil {
		return false, fmt.Errorf("enqueue webhook event: %w", err)
	}

	return cmd.RowsAffected() == 1, nil
}

func (q *WebhookQueue) ClaimNext(ctx context.Context, provider, workerID string, leaseTimeout time.Duration) (*WebhookJob, error) {
	staleBefore := time.Now().UTC().Add(-leaseTimeout)

	row := q.db.QueryRow(ctx, `
		WITH candidate AS (
			SELECT id
			FROM webhook_events
			WHERE provider = $1
			  AND attempts < max_attempts
			  AND (
					(status = 'pending' AND next_attempt_at <= NOW())
					OR
					(status = 'processing' AND processing_started_at <= $2)
			  )
			ORDER BY created_at
			LIMIT 1
			FOR UPDATE SKIP LOCKED
		)
		UPDATE webhook_events we
		SET
			status = 'processing',
			attempts = we.attempts + 1,
			processing_started_at = NOW(),
			locked_by = $3,
			last_error = NULL,
			updated_at = NOW()
		FROM candidate
		WHERE we.id = candidate.id
		RETURNING
			we.id,
			we.provider,
			we.event_id,
			we.event_type,
			we.payload::text,
			we.attempts,
			we.max_attempts
	`, provider, staleBefore, workerID)

	var job WebhookJob
	var payloadText string

	err := row.Scan(
		&job.ID,
		&job.Provider,
		&job.EventID,
		&job.EventType,
		&payloadText,
		&job.Attempts,
		&job.MaxAttempts,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("claim webhook job: %w", err)
	}

	job.Payload = []byte(payloadText)
	return &job, nil
}

func (q *WebhookQueue) MarkCompleted(ctx context.Context, id int64) error {
	_, err := q.db.Exec(ctx, `
		UPDATE webhook_events
		SET
			status = 'completed',
			processed_at = NOW(),
			processing_started_at = NULL,
			locked_by = NULL,
			updated_at = NOW()
		WHERE id = $1
	`, id)
	if err != nil {
		return fmt.Errorf("mark webhook job completed: %w", err)
	}
	return nil
}

func (q *WebhookQueue) MarkFailed(ctx context.Context, job *WebhookJob, processErr error) error {
	nextAttempt := time.Now().UTC().Add(retryDelay(job.Attempts))
	lastError := truncateForDB(processErr.Error(), 4000)

	_, err := q.db.Exec(ctx, `
		UPDATE webhook_events
		SET
			status = CASE
				WHEN attempts >= max_attempts THEN 'dead_letter'
				ELSE 'pending'
			END,
			next_attempt_at = CASE
				WHEN attempts >= max_attempts THEN next_attempt_at
				ELSE $2
			END,
			last_error = $3,
			processing_started_at = NULL,
			locked_by = NULL,
			dead_lettered_at = CASE
				WHEN attempts >= max_attempts THEN NOW()
				ELSE dead_lettered_at
			END,
			updated_at = NOW()
		WHERE id = $1
	`, job.ID, nextAttempt, lastError)
	if err != nil {
		return fmt.Errorf("mark webhook job failed: %w", err)
	}

	return nil
}

type WebhookWorker struct {
	queue        *WebhookQueue
	processor    WebhookProcessor
	provider     string
	workerID     string
	pollInterval time.Duration
	leaseTimeout time.Duration
	jobTimeout   time.Duration
}

func NewWebhookWorker(queue *WebhookQueue, provider string, processor WebhookProcessor) *WebhookWorker {
	host, _ := os.Hostname()

	return &WebhookWorker{
		queue:        queue,
		processor:    processor,
		provider:     provider,
		workerID:     fmt.Sprintf("%s:%d:%s", host, os.Getpid(), provider),
		pollInterval: 2 * time.Second,
		leaseTimeout: 5 * time.Minute,
		jobTimeout:   45 * time.Second,
	}
}

func (w *WebhookWorker) Start(ctx context.Context) {
	slog.Info("Webhook worker started",
		"provider", w.provider,
		"worker_id", w.workerID,
	)

	defer slog.Info("Webhook worker stopped",
		"provider", w.provider,
		"worker_id", w.workerID,
	)

	timer := time.NewTimer(0)
	defer timer.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
		}

		processed, err := w.processNext(ctx)
		if err != nil {
			slog.Error("Webhook worker iteration failed",
				"provider", w.provider,
				"worker_id", w.workerID,
				"error", err,
			)
		}

		if processed {
			timer.Reset(0)
		} else {
			timer.Reset(w.pollInterval)
		}
	}
}

func (w *WebhookWorker) processNext(ctx context.Context) (bool, error) {
	job, err := w.queue.ClaimNext(ctx, w.provider, w.workerID, w.leaseTimeout)
	if err != nil {
		return false, err
	}
	if job == nil {
		return false, nil
	}

	jobCtx, cancel := context.WithTimeout(ctx, w.jobTimeout)
	processErr := w.processor.ProcessQueuedWebhook(jobCtx, job.Provider, job.Payload)
	cancel()

	if processErr != nil {
		if err := w.queue.MarkFailed(ctx, job, processErr); err != nil {
			return true, fmt.Errorf("process webhook job: %v; mark failed: %w", processErr, err)
		}

		slog.Warn("Webhook job failed",
			"provider", job.Provider,
			"event_id", job.EventID,
			"event_type", job.EventType,
			"attempts", job.Attempts,
			"error", processErr,
		)
		return true, nil
	}

	if err := w.queue.MarkCompleted(ctx, job.ID); err != nil {
		return true, fmt.Errorf("mark webhook job completed: %w", err)
	}

	slog.Info("Webhook job completed",
		"provider", job.Provider,
		"event_id", job.EventID,
		"event_type", job.EventType,
	)

	return true, nil
}

func retryDelay(attempt int) time.Duration {
	base := 30 * time.Second
	max := 30 * time.Minute

	if attempt < 1 {
		return base
	}

	delay := base
	for i := 1; i < attempt; i++ {
		delay *= 2
		if delay >= max {
			return max
		}
	}
	return delay
}

func truncateForDB(value string, max int) string {
	if len(value) <= max {
		return value
	}
	return value[:max]
}
