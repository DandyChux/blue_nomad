package handlers

import (
	"blue-nomad-api/services"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	gomail "gopkg.in/gomail.v2"
)

type SubscribeRequest struct {
	Email      string         `json:"email"`
	Properties map[string]any `json:"properties,omitempty"`
}

type SendMailRequest struct {
	Email   string `json:"email"`
	SendTo  string `json:"sendTo,omitempty"`
	Subject string `json:"subject"`
	Text    string `json:"text"`
	HTML    string `json:"html,omitempty"`
}

var (
	HUBSPOT_API_KEY = os.Getenv("HUBSPOT_API_KEY")
	HUBSPOT_LIST_ID = os.Getenv("HUBSPOT_LIST_ID")
)

// Initialize a reusable HubSpot client
var hubspotClient *services.HTTPClient

func init() {
	// Initialize the HTTP client with config
	hubspotClient = services.NewHTTPClientWithConfig(services.HTTPClientConfig{
		BaseURL:    "https://api.hubapi.com",
		Timeout:    15 * time.Second,
		RetryCount: 2,
		RetryDelay: 1 * time.Second,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	})

	// Set the bearer token if available
	if HUBSPOT_API_KEY != "" {
		hubspotClient.SetBearerToken(HUBSPOT_API_KEY)
	}
}

func Subscribe(w http.ResponseWriter, r *http.Request) {
	var payload SubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if HUBSPOT_API_KEY == "" {
		http.Error(w, "HUBSPOT_API_KEY not set", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	// Try to add or update the contact in HubSpot
	result, err := addToHubSpot(ctx, payload.Email, payload.Properties)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error with HubSpot: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// addToHubSpot adds or updates a contact in HubSpot CRM
func addToHubSpot(ctx context.Context, email string, properties map[string]any) (map[string]any, error) {
	// Build properties object with email and any additional properties
	contactProperties := map[string]any{
		"email":          email,
		"hs_lead_status": "NEW",
		"lifecyclestage": "subscriber",
	}
	for k, v := range properties {
		contactProperties[k] = v
	}

	// Create request body
	bodyData := map[string]any{"properties": contactProperties}

	// First, try to create the contact
	resp, err := hubspotClient.Post(ctx, "/crm/v3/objects/contacts", bodyData)

	// If creation was successful
	if err == nil && resp.IsSuccess() {
		var contact map[string]any
		if err := resp.JSON(&contact); err != nil {
			return nil, fmt.Errorf("error decoding response: %w", err)
		}

		// Optionally add to a specific list if configured
		if HUBSPOT_LIST_ID != "" {
			if contactID, ok := contact["id"].(string); ok {
				addContactToList(ctx, contactID, HUBSPOT_LIST_ID)
			}
		}

		return map[string]any{
			"success": true,
			"contact": contact,
			"created": true,
		}, nil
	}

	// If contact exists (409 conflict), update it instead
	if resp != nil && resp.StatusCode == 409 {
		return handleExistingContact(ctx, email, properties)
	}

	// If we get here, something went wrong
	if err != nil {
		return nil, fmt.Errorf("failed to create contact: %w", err)
	}
	return nil, fmt.Errorf("failed to create contact: %s", resp.String())
}

// handleExistingContact searches for and updates an existing contact
func handleExistingContact(ctx context.Context, email string, properties map[string]any) (map[string]any, error) {
	// Search for the existing contact
	searchBody := map[string]any{
		"filterGroups": []map[string]any{
			{
				"filters": []map[string]any{
					{
						"propertyName": "email",
						"operator":     "EQ",
						"value":        email,
					},
				},
			},
		},
	}

	searchResp, err := hubspotClient.Post(ctx, "/crm/v3/objects/contacts/search", searchBody)
	if err != nil || !searchResp.IsSuccess() {
		return nil, fmt.Errorf("failed to search for existing contact: %w", err)
	}

	var searchData map[string]any
	if err := searchResp.JSON(&searchData); err != nil {
		return nil, fmt.Errorf("error decoding search response: %w", err)
	}

	// Check if we found the contact
	results, ok := searchData["results"].([]any)
	if !ok || len(results) == 0 {
		return nil, fmt.Errorf("contact not found in search results")
	}

	// Get the contact ID
	firstResult, ok := results[0].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid search result format")
	}

	contactID, ok := firstResult["id"].(string)
	if !ok {
		return nil, fmt.Errorf("contact ID not found")
	}

	// Update the existing contact
	updateProperties := map[string]any{
		"lifecyclestage": "subscriber",
	}
	for k, v := range properties {
		updateProperties[k] = v
	}

	updateBody := map[string]any{"properties": updateProperties}

	updateResp, err := hubspotClient.Patch(ctx, fmt.Sprintf("/crm/v3/objects/contacts/%s", contactID), updateBody)
	if err != nil || !updateResp.IsSuccess() {
		return nil, fmt.Errorf("failed to update contact: %w", err)
	}

	var contact map[string]any
	if err := updateResp.JSON(&contact); err != nil {
		return nil, fmt.Errorf("error decoding update response: %w", err)
	}

	// Add to list if not already there
	if HUBSPOT_LIST_ID != "" {
		addContactToList(ctx, contactID, HUBSPOT_LIST_ID)
	}

	return map[string]any{
		"success": true,
		"contact": contact,
		"updated": true,
	}, nil
}

// addContactToList adds a contact to a specific HubSpot list
func addContactToList(ctx context.Context, contactID string, listID string) {
	if HUBSPOT_API_KEY == "" {
		return
	}

	// HubSpot expects an array of contact IDs
	body := []string{contactID}

	resp, err := hubspotClient.Request(
		ctx,
		"PUT",
		fmt.Sprintf("/crm/v3/lists/%s/memberships/add", listID),
		nil,
		body,
		nil,
	)

	if err != nil || !resp.IsSuccess() {
		fmt.Printf("Failed to add contact to list: %v\n", err)
		return
	}

	fmt.Printf("Contact %s added to list %s\n", contactID, listID)
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
