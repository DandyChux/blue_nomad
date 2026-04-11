package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"

	"github.com/dandychux/blue_nomad/internal/handlers"
	"github.com/dandychux/blue_nomad/internal/middleware"
	"github.com/dandychux/blue_nomad/internal/services"

	"github.com/joho/godotenv"
)

// spaFileServer serves static files from the SvelteKit build output directory.
// If the requested file does not exist on disk, it falls back to serving
// index.html so that SvelteKit's client-side router can handle the route.
type spaFileServer struct {
	staticDir  string
	fileServer http.Handler
}

func newSPAFileServer(staticDir string) *spaFileServer {
	return &spaFileServer{
		staticDir:  staticDir,
		fileServer: http.FileServer(http.Dir(staticDir)),
	}
}

func (s *spaFileServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Clean the URL path to prevent directory traversal
	urlPath := filepath.Clean(r.URL.Path)

	// Build the full file path on disk
	filePath := filepath.Join(s.staticDir, urlPath)

	// Check if the requested file exists on disk
	info, err := os.Stat(filePath)
	if err == nil && !info.IsDir() {
		// File exists — serve it directly (CSS, JS, images, fonts, etc.)
		s.fileServer.ServeHTTP(w, r)
		return
	}

	// If it's a directory, check for an index.html inside it
	if err == nil && info.IsDir() {
		indexPath := filepath.Join(filePath, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			s.fileServer.ServeHTTP(w, r)
			return
		}
	}

	// File doesn't exist — serve the root index.html (SPA fallback)
	http.ServeFile(w, r, filepath.Join(s.staticDir, "index.html"))
}

// responseWriter wraps http.ResponseWriter to capture the status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// ── Configure structured logging ────────────────────────────────────────────────
	logLevel := slog.LevelInfo
	if os.Getenv("LOG_LEVEL") == "debug" {
		logLevel = slog.LevelDebug
	}
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: logLevel,
	})))

	// ── Initialize services ────────────────────────────────────────────────
	services.InitS3Client()

	sanityClient := services.NewSanityClient(
		os.Getenv("SANITY_PROJECT_ID"),
		os.Getenv("SANITY_DATASET"),
		"2025-02-19",
		os.Getenv("SANITY_API_TOKEN"),
	)

	squareClient := services.NewSquareClient(
		os.Getenv("SQUARE_API_KEY"),
		"2026-01-22",
	)

	// ── Initialize handlers ────────────────────────────────────────────────
	newsletterHandler := handlers.NewNewsletterHandler()
	webhookHandler := handlers.NewWebhookHandler(
		os.Getenv("WEBHOOK_SECRET"),
		os.Getenv("SQUARE_WEBHOOK_SIGNATURE_KEY"),
		os.Getenv("SQUARE_WEBHOOK_URL"),
		sanityClient,
	)
	postHandler := handlers.NewPostHandler(sanityClient)
	shopHandler := handlers.NewShopHandler(squareClient)
	bookingHandler := handlers.NewBookingHandler(squareClient)
	diagnosticHandler := handlers.NewDiagnosticHandler(newsletterHandler)

	// ── API routes ────────────────────────────────────────────────
	api := http.NewServeMux()

	// Healthcheck
	api.HandleFunc("GET /healthcheck", webhookHandler.Health)

	// Newsletter
	api.HandleFunc("POST /subscribe", newsletterHandler.Subscribe)
	api.HandleFunc("POST /send-mail", newsletterHandler.SendMail)

	// Diagnostic
	api.HandleFunc("POST /diagnostic", diagnosticHandler.Submit)

	// Blog posts
	api.HandleFunc("GET /posts", postHandler.ListPosts)
	api.HandleFunc("GET /posts/recent", postHandler.RecentPosts)
	api.HandleFunc("GET /posts/{slug}", postHandler.GetPost)

	// Webhooks & cache
	api.HandleFunc("POST /revalidate", webhookHandler.Revalidate)
	api.HandleFunc("GET /cache/status", webhookHandler.LastInvalidation)

	// Shop
	api.HandleFunc("GET /shop/catalog", shopHandler.GetCatalog)
	api.HandleFunc("POST /checkout", shopHandler.CreateCheckoutLink)

	// Booking
	api.HandleFunc("GET /booking/services", bookingHandler.GetServices)
	api.HandleFunc("POST /booking/availability", bookingHandler.GetAvailability)
	api.HandleFunc("POST /booking/create", bookingHandler.CreateBooking)

	// ── Static frontend files ───────────────────────────────────────────
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "./ui/build"
	}
	slog.Info("Serving static files", "dir", staticDir)

	// ── Root mux ───────────────────────────────────────────
	rootMux := http.NewServeMux()
	rootMux.Handle("/api/", http.StripPrefix("/api", api))
	rootMux.Handle("/", middleware.StaticCacheMiddleware(newSPAFileServer(staticDir)))

	// Wrap the root mux with middleware
	handler := middleware.Logger(rootMux)
	handler = middleware.CorsMiddleware(handler)

	// ── Start server ─────────────────────────────────────────────────
	port := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		port = ":" + p
	}
	slog.Info("Server starting on", "port", port)
	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
