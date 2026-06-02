package services

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/mailgun/mailgun-go/v4"
)

var (
	emailTemplates     map[string]*template.Template
	emailTemplatesOnce sync.Once
)

// EmailConfig holds email configuration
type EmailConfig struct {
	From string
}

// EmailMessage represents an email message
type EmailMessage struct {
	To           []string
	Cc           []string
	Bcc          []string
	Subject      string
	BodyHTML     string
	BodyText     string
	TemplateID   string
	TemplateData interface{}
}

// getConfig returns email configuration from environment
func getConfig() EmailConfig {
	config := EmailConfig{
		From: os.Getenv("EMAIL_FROM"),
	}

	// Default to Gmail if not specified
	if config.From == "" {
		config.From = "Blue Nomad <hello@mg.bluenomadworld.com>"
	}

	return config
}

// SendEmail sends an email message
func SendEmail(msg *EmailMessage) error {
	config := getConfig()

	mailgunApiKey := os.Getenv("MAILGUN_API_KEY")
	if mailgunApiKey == "" {
		return fmt.Errorf("missing MAILGUN_API_KEY")
	}

	domain := os.Getenv("MAILGUN_DOMAIN")
	if domain == "" {
		domain = "mg.bluenomadworld.com"
	}

	// Process template if specified
	if msg.TemplateID != "" {
		emailTemplatesOnce.Do(loadEmailTemplates)

		if tmpl, ok := emailTemplates[msg.TemplateID]; ok {
			var buf bytes.Buffer
			if err := tmpl.Execute(&buf, msg.TemplateData); err != nil {
				return fmt.Errorf("failed to render email template: %w", err)
			}
			msg.BodyHTML = buf.String()
		}
	}

	if msg.BodyHTML == "" && msg.BodyText == "" {
		return fmt.Errorf("no email body provided")
	}

	// Initialize the Mailgun client
	mg := mailgun.NewMailgun(domain, mailgunApiKey)

	mgMessage := mailgun.NewMessage(config.From, msg.Subject, msg.BodyText)

	if msg.BodyHTML != "" {
		mgMessage.SetHTML(msg.BodyHTML)
	}

	// Add recipients
	for _, to := range msg.To {
		if err := mgMessage.AddRecipient(to); err != nil {
			return fmt.Errorf("failed to add recipient %s: %w", to, err)
		}
	}
	for _, cc := range msg.Cc {
		mgMessage.AddCC(cc)
	}
	for _, bcc := range msg.Bcc {
		mgMessage.AddBCC(bcc)
	}

	// Create contexxt with a timeout for the API call
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	// Send the message
	_, id, err := mg.Send(ctx, mgMessage)
	if err != nil {
		return fmt.Errorf("failed to send email via Mailgun: %w", err)
	}

	log.Printf("Email sent via Mailgun w/ ID: %s", id)
	return nil
}

// SendSubscriptionNotification sends a notification about a new subscription
func SendSubscriptionNotification(subscriberEmail string) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = os.Getenv("EMAIL_USERNAME")
	}
	if adminEmail == "" {
		adminEmail = "hello@bluenomad.nyc"
	}

	return SendEmail(&EmailMessage{
		To:       []string{adminEmail},
		Subject:  "New Blue Nomad Subscription",
		BodyText: fmt.Sprintf("New subscriber: %s", subscriberEmail),
		BodyHTML: fmt.Sprintf(`
			<h2>New Subscription</h2>
			<p>A new user has subscribed to Blue Nomad updates:</p>
			<p><strong>Email:</strong> %s</p>
		`, subscriberEmail),
	})
}

// SendContactForm sends a contact form submission
func SendContactForm(name, email, subject, message string) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = os.Getenv("EMAIL_USERNAME")
	}
	if adminEmail == "" {
		return fmt.Errorf("no admin email configured")
	}

	return SendEmail(&EmailMessage{
		To:         []string{adminEmail},
		Subject:    fmt.Sprintf("Contact Form: %s", subject),
		TemplateID: "contact-form",
		TemplateData: map[string]string{
			"Name":    name,
			"Email":   email,
			"Subject": subject,
			"Message": message,
		},
	})
}

// loadEmailTemplates loads email templates
func loadEmailTemplates() {
	emailTemplates = make(map[string]*template.Template)

	// Default contact form template
	contactFormTemplate := `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
				.content { background-color: #f9fafb; padding: 30px; margin-top: 20px; }
				.field { margin-bottom: 20px; }
				.label { font-weight: bold; color: #4b5563; }
				.value { margin-top: 5px; padding: 10px; background-color: white; border-radius: 4px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>New Contact Form Submission</h1>
				</div>
				<div class="content">
					<div class="field">
						<div class="label">Name:</div>
						<div class="value">{{.Name}}</div>
					</div>
					<div class="field">
						<div class="label">Email:</div>
						<div class="value">{{.Email}}</div>
					</div>
					<div class="field">
						<div class="label">Subject:</div>
						<div class="value">{{.Subject}}</div>
					</div>
					<div class="field">
						<div class="label">Message:</div>
						<div class="value">{{.Message}}</div>
					</div>
				</div>
			</div>
		</body>
		</html>
	`

	emailTemplates["contact-form"] = template.Must(template.New("contact-form").Parse(contactFormTemplate))

	// Load templates from files if directory exists
	templatesDir := "templates/email"
	if _, err := os.Stat(templatesDir); err == nil {
		files, _ := filepath.Glob(filepath.Join(templatesDir, "*.html"))
		for _, file := range files {
			name := strings.TrimSuffix(filepath.Base(file), filepath.Ext(file))
			if tmpl, err := template.ParseFiles(file); err == nil {
				emailTemplates[name] = tmpl
				log.Printf("Loaded email template: %s", name)
			}
		}
	}
}
