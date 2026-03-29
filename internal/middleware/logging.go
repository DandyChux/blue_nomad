package middleware

import (
	"log/slog"
	"net/http"
	"time"
)

// responseRecorder wraps http.ResponseWriter to capture the status code and
// bytes written so they can be logged after the handler returns.
type responseRecorder struct {
	http.ResponseWriter
	statusCode   int
	bytesWritten int
}

func newResponseRecorder(w http.ResponseWriter) *responseRecorder {
	return &responseRecorder{
		ResponseWriter: w,
		statusCode:     http.StatusOK, // default if WriteHeader is never called
	}
}

func (rec *responseRecorder) WriteHeader(code int) {
	rec.statusCode = code
	rec.ResponseWriter.WriteHeader(code)
}

func (rec *responseRecorder) Write(b []byte) (int, error) {
	n, err := rec.ResponseWriter.Write(b)
	rec.bytesWritten += n
	return n, err
}

// Logging returns middleware that logs every HTTP request and its response.
// Each log line includes method, path, status code, duration, and bytes written.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := newResponseRecorder(w)

		// Call the next handler
		next.ServeHTTP(rec, r)

		duration := time.Since(start)

		// Build log attributes
		attrs := []slog.Attr{
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.String("query", r.URL.RawQuery),
			slog.Int("status", rec.statusCode),
			slog.String("duration", duration.String()),
			slog.Int("bytes", rec.bytesWritten),
			slog.String("remote", r.RemoteAddr),
			slog.String("user_agent", r.UserAgent()),
		}

		// Log at different levels based on status code
		switch {
		case rec.statusCode >= 500:
			slog.LogAttrs(r.Context(), slog.LevelError, "HTTP request", attrs...)
		case rec.statusCode >= 400:
			slog.LogAttrs(r.Context(), slog.LevelWarn, "HTTP request", attrs...)
		default:
			slog.LogAttrs(r.Context(), slog.LevelInfo, "HTTP request", attrs...)
		}
	})
}

// Stack composes middleware left-to-right so they execute in the order listed.
// Usage: Stack(requireAuth, RequireAdmin)(handler)
// func Stack(middlewares ...func(http.Handler) http.Handler) func(http.Handler) http.Handler {
// 		return func(next http.Handler) http.Handler {
// 			for i := len(middlewares) - 1; i >= 0; i-- {
// 				next = middlewares[i](next)
// 			}
// 			return next
// 		}
// }
