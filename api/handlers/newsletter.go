package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	gomail "gopkg.in/gomail.v2"
)

type SubscribeRequest struct {
	Email string `json:"email"`
}

type SendMailRequest struct {
	Email   string `json:"email"`
	SendTo  string `json:"sendTo,omitempty"`
	Subject string `json:"subject"`
	Text    string `json:"text"`
	HTML    string `json:"html,omitempty"`
}

func Subscribe(w http.ResponseWriter, r *http.Request) {
	var req SubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create email message
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("EMAIL_USERNAME"))
	m.SetHeader("To", os.Getenv("EMAIL_USERNAME"))
	m.SetHeader("Subject", "New Subscription")
	m.SetBody("text/plain", "New subscriber: "+req.Email)

	// Send email
	if err := sendEmail(m); err != nil {
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Email sent",
	})
}

func SendMail(w http.ResponseWriter, r *http.Request) {
	var req SendMailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create email message
	m := gomail.NewMessage()
	m.SetHeader("From", req.Email)

	sendTo := req.SendTo
	if sendTo == "" {
		sendTo = os.Getenv("EMAIL_USERNAME")
	}
	m.SetHeader("To", sendTo)
	m.SetHeader("Subject", req.Subject)

	if req.HTML != "" {
		m.SetBody("text/html", req.HTML)
		m.AddAlternative("text/plain", req.Text)
	} else {
		m.SetBody("text/plain", req.Text)
	}

	// Send email
	if err := sendEmail(m); err != nil {
		http.Error(w, "Error sending email", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Email sent successfully",
		"to":      sendTo,
	})
}

func sendEmail(m *gomail.Message) error {
	d := gomail.NewDialer("smtp.gmail.com", 587, os.Getenv("EMAIL_USERNAME"), os.Getenv("EMAIL_PASSWORD"))
	return d.DialAndSend(m)
}
