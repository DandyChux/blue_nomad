package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

var (
	emailTemplates     map[string]*template.Template
	emailTemplatesOnce sync.Once
)

// EmailConfig holds email configuration
type EmailConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
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
		Host:     os.Getenv("EMAIL_HOST"),
		Port:     os.Getenv("EMAIL_PORT"),
		Username: os.Getenv("EMAIL_USERNAME"),
		Password: os.Getenv("EMAIL_PASSWORD"),
		From:     os.Getenv("EMAIL_FROM"),
	}

	// Default to Gmail if not specified
	if config.Host == "" {
		config.Host = "smtp.gmail.com"
	}
	if config.Port == "" {
		config.Port = "587"
	}
	if config.From == "" && config.Username != "" {
		config.From = config.Username
	}

	return config
}

// SendEmail sends an email message
func SendEmail(msg *EmailMessage) error {
	config := getConfig()

	if config.Host == "" || config.Port == "" || config.Username == "" || config.Password == "" {
		return fmt.Errorf("missing email configuration")
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

	// Build email content
	var messageBuffer bytes.Buffer

	// Headers
	headers := map[string]string{
		"From":         config.From,
		"To":           strings.Join(msg.To, ", "),
		"Subject":      msg.Subject,
		"MIME-Version": "1.0",
	}

	if len(msg.Cc) > 0 {
		headers["Cc"] = strings.Join(msg.Cc, ", ")
	}

	// Write headers
	for k, v := range headers {
		messageBuffer.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}

	// Content type based on body
	if msg.BodyHTML != "" {
		messageBuffer.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
		messageBuffer.WriteString("\r\n")
		messageBuffer.WriteString(msg.BodyHTML)
	} else if msg.BodyText != "" {
		messageBuffer.WriteString("Content-Type: text/plain; charset=UTF-8\r\n")
		messageBuffer.WriteString("\r\n")
		messageBuffer.WriteString(msg.BodyText)
	} else {
		return fmt.Errorf("no email body provided")
	}

	// Send via SMTP
	return sendSMTP(config, msg, messageBuffer.Bytes())
}

func sendSMTP(config EmailConfig, msg *EmailMessage, body []byte) error {
	addr := fmt.Sprintf("%s:%s", config.Host, config.Port)

	// All recipients
	recipients := append([]string{}, msg.To...)
	recipients = append(recipients, msg.Cc...)
	recipients = append(recipients, msg.Bcc...)

	// TLS config
	tlsConfig := &tls.Config{
		ServerName: config.Host,
	}

	// Connect to server
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer client.Close()

	// Start TLS
	if err = client.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("failed to start TLS: %w", err)
	}

	// Authenticate
	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	// Set sender
	if err = client.Mail(config.From); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Add recipients
	for _, recipient := range recipients {
		if err = client.Rcpt(recipient); err != nil {
			return fmt.Errorf("failed to add recipient %s: %w", recipient, err)
		}
	}

	// Send email data
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to open data connection: %w", err)
	}

	_, err = w.Write(body)
	if err != nil {
		return fmt.Errorf("failed to write email data: %w", err)
	}

	err = w.Close()
	if err != nil {
		return fmt.Errorf("failed to close data connection: %w", err)
	}

	client.Quit()

	log.Printf("Email sent to %v with subject: %s", msg.To, msg.Subject)
	return nil
}

// SendSubscriptionNotification sends a notification about a new subscription
func SendSubscriptionNotification(subscriberEmail string) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = os.Getenv("EMAIL_USERNAME")
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
