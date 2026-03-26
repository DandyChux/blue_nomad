package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"
)

// S3Client is the client for interacting with S3-compatible storage
var S3Client *s3.Client

// InitS3Client initializes the S3 client for Block Storage
func InitS3Client() {
	key := os.Getenv("STORAGE_KEY")
	secret := os.Getenv("STORAGE_SECRET")
	token := os.Getenv("STORAGE_TOKEN")
	region := os.Getenv("STORAGE_REGION")

	s3Config := &aws.Config{
		Credentials: credentials.NewStaticCredentialsProvider(
			key,
			secret,
			token,
		),
		BaseEndpoint: aws.String(fmt.Sprintf("https://%s", os.Getenv("STORAGE_ENDPOINT"))),
		Region:       region,
	}

	S3Client = s3.NewFromConfig(*s3Config)
}

// UploadFile uploads a file to Block Storage
func UploadFile(fileData io.Reader, filename string, contentType string, folder string) (string, error) {
	// Generate a unique filename
	ext := filepath.Ext(filename)
	basename := strings.TrimSuffix(filepath.Base(filename), ext)
	safeBasename := strings.ReplaceAll(basename, " ", "-")
	safeBasename = strings.ToLower(safeBasename)

	uniqueFilename := fmt.Sprintf("%s-%s%s", safeBasename, uuid.New().String()[:8], ext)

	// Read file data into buffer
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, fileData); err != nil {
		return "", fmt.Errorf("failed to read file data: %w", err)
	}

	// If content type is not provided, detect it
	if contentType == "" {
		contentType = http.DetectContentType(buf.Bytes())
	}

	if folder == "" {
		// Default folder structure: organize by date: 2023/05/
		currentTime := time.Now()
		folder = fmt.Sprintf("%d/%02d/", currentTime.Year(), currentTime.Month())
	}

	// Ensure folder doesn't have leading/trailing slashes and add trailing slash if needed
	folder = strings.Trim(folder, "/")
	if folder != "" {
		folder = folder + "/"
	}

	key := folder + uniqueFilename

	// Upload to Block Storage
	_, err := S3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(os.Getenv("STORAGE_BUCKET")),
		Key:           aws.String(key),
		Body:          bytes.NewReader(buf.Bytes()),
		ContentLength: aws.Int64(int64(buf.Len())),
		ContentType:   aws.String(contentType),
		ACL:           types.ObjectCannedACLPublicRead,
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// Return the public URL
	fileURL := fmt.Sprintf("https://%s.%s/%s",
		os.Getenv("STORAGE_BUCKET"),
		os.Getenv("STORAGE_ENDPOINT"),
		key,
	)

	return fileURL, nil
}
