# YaYa Wallet Webhook Endpoint

A secure, maintainable, and scalable Node.js webhook endpoint for YaYa Wallet to receive and process transaction notifications.

## Features

* **Secure**: Uses HMAC-SHA256 for signature verification to ensure the payload is authentic and not tampered with.
* **Maintainable**: Organized codebase with clear and concise functions makes it easy to understand and extend.
* **Scalable**: Built with Express.js and uses MongoDB for replay protection and data storage, making it suitable for high-traffic applications.
* **Flexible**: Can be easily extended to support additional processing (e.g., notifying partners) or different data storage solutions.

## Assumptions

* **Webhook Payload**: YaYa Wallet sends a JSON payload with fields: id (unique event ID), amount, currency, created_at_time (Unix timestamp), full_name, account_name, invoice_url, and others.
* **Signature**: The x-webhook-signature header contains an HMAC-SHA256 hash of the payload, signed with a secret key.
* **Replay Protection**: Uses MongoDB to store event IDs and reject duplicates.
* **Environment**: Sensitive data (e.g., webhook secret, MongoDB URI) are stored in a .env file.
* **HTTPS**: The endpoint should be deployed with HTTPS (e.g., via ngrok locally or a reverse proxy in production).
* **Processing**: Logs and stores transactions in MongoDB as an example. Additional processing (e.g., notifying partners) can be added.

## Setup

### Prerequisites

* **Node.js** (v14+)
* **MongoDB** (local or MongoDB Atlas)
* **npm**

### Clone Repository

git clone <your-repo-url>
cd yayawallet-webhook

### Install Dependencies

npm install

### Configure Environment

Create a .env file:

PORT=3000
WEBHOOK_SECRET=your-secret-key
MONGODB_URI=

Replace your-secret-key with the YaYa Wallet webhook secret and update MONGODB_URI if needed.

### Start MongoDB

Ensure MongoDB is running locally or use a cloud instance.

### Run the Server

node index.js

The server runs at http://localhost:3000.

## Testing

### Local Testing

Use Postman or curl to send a POST request to http://localhost:3000/webhook.

Generate the signature:

### Replay Testing

Send the same payload twice. First response: { "message": "Webhook received successfully" } (200). Second: { "message": "Event already processed" } (200).

### Signature Testing

Invalid signature: Returns { "error": "Invalid signature" } (401).
Missing signature: Returns { "error": "Missing signature header" } (401).

### Invalid Payload

Missing required fields: Returns { "error": "Invalid payload" } (400).

### Health Check

GET http://localhost:3000/health returns { "status": "OK" } (200).

