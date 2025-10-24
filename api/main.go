package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"blue-nomad-api/handlers"
	"blue-nomad-api/middleware"
	"blue-nomad-api/services"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func init() {
	// Load environment variables from .env file in development
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}

	if env == "development" {
		if err := godotenv.Load("../.env"); err != nil {
			log.Println("No .env file found")
		}
	}

	// Initialize S3 client
	services.InitS3Client()
}

// loggingMiddleware logs each request with method, path, status, and duration
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap the ResponseWriter to capture the status code
		wrapped := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(wrapped, r)

		// Use fmt.Printf to write to stdout for successful requests
		if wrapped.statusCode < 400 {
			fmt.Printf("%s %s %d %v\n", r.Method, r.URL.Path, wrapped.statusCode, time.Since(start))
		} else {
			// Use log.Printf (stderr) for errors
			log.Printf("ERROR: %s %s %d %v", r.Method, r.URL.Path, wrapped.statusCode, time.Since(start))
		}
	})
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
		log.Println("No .env file found")
	}

	// Create router
	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Healthcheck
	api.HandleFunc("/healthcheck", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("GET")

	// Routes
	api.HandleFunc("/subscribe", handlers.Subscribe).Methods("POST", "OPTIONS")
	api.HandleFunc("/send-mail", handlers.SendMail).Methods("POST", "OPTIONS")
	api.HandleFunc("/revalidate", handlers.Revalidate).Methods("POST")

	// Setup CORS
	baseURL := os.Getenv("BASE_URL")
	allowedOrigins := []string{
		"http://localhost:3000",
		baseURL,
	}
	corsMiddleware := middleware.SetupCORS(allowedOrigins)

	// Apply CORS to all routes
	handler := corsMiddleware.Handler(router)

	// Apply logging middleware
	handler = loggingMiddleware(handler)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
