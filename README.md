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

