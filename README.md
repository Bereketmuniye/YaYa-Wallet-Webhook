# YaYa Wallet Webhook Endpoint

This is a Node.js webhook endpoint for YaYa Wallet to receive and process transaction notifications. It uses Express.js for the server, MongoDB for replay protection and data storage, and HMAC-SHA256 for signature verification. The solution is secure, maintainable, and meets the assignment requirements.

## Assumptions

* Webhook Payload: YaYa Wallet sends a JSON payload with fields: id (unique event ID), amount, currency, created_at_time (Unix timestamp), full_name, account_name, invoice_url, and others.
* Signature: The x-webhook-signature header contains an HMAC-SHA256 hash of the payload, signed with a secret key.
* Replay Protection: Uses MongoDB to store event IDs and reject duplicates.
* Environment: Sensitive data (e.g., webhook secret, MongoDB URI) are stored in a .env file.
* HTTPS: The endpoint should be deployed with HTTPS (e.g., via ngrok locally or a reverse proxy in production).
* Processing: Logs and stores transactions in MongoDB as an example. Additional processing (e.g., notifying partners) can be added.

## Setup

### Prerequisites

* Node.js (v14+)
* MongoDB (local or MongoDB Atlas)
* npm

### Clone Repository

git clone <your-repo-url>
cd yayawallet-webhook

### Install Dependencies

npm install

### Configure Environment

Create a .env file:

PORT=3000
WEBHOOK_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017

Replace your-secret-key with the YaYa Wallet webhook secret and update MONGODB_URI if needed.

### Start MongoDB

Ensure MongoDB is running locally or use a cloud instance.

### Run the Server

node index.js

The server runs at http://localhost:3000.

## Testing

### Local Testing

Use Postman or curl to send a POST request to http://localhost:3000/webhook.

Example payload:

{
  "id": "1dd2854e-3a79-4548-ae36-97e4a18ebf81",
  "amount": 100,
  "currency": "ETB",
  "created_at_time": 1673381836,
  "timestamp": 1701272333,
  "cause": "Testing",
  "full_name": "Abebe Kebede",
  "account_name": "abebekebede1",
  "invoice_url": "https://yayawallet.com/en/invoice/xxxx"
}

Generate the signature:

const crypto = require('crypto');
const payload = JSON.stringify({ ... }); 
const secret = 'your-secret-key';
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log(signature);

Example curl:

curl -X POST http://localhost:3000/webhook \
-H "Content-Type: application/json" \
-H "x-webhook-signature: <signature>" \
-d '{"id":"1dd2854e-3a79-4548-ae36-97e4a18ebf81","amount":100,"currency":"ETB","created_at_time":1673381836,"timestamp":1701272333,"cause":"Testing","full_name":"Abebe Kebede","account_name":"abebekebede1","invoice_url":"https://yayawallet.com/en/invoice/xxxx"}'

### Replay Testing

Send the same payload twice. First response: { "message": "Webhook received successfully" } (200). Second: { "message": "Event already processed" } (200).

### Signature Testing

Invalid signature: Returns { "error": "Invalid signature" } (401).
Missing signature: Returns { "error": "Missing signature header" } (401).

### Invalid Payload

Missing required fields: Returns { "error": "Invalid payload" } (400).

### Health Check

GET http://localhost:3000/health returns { "status": "OK" } (200).

