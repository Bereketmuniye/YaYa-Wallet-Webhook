const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "yayawallet";
const COLLECTION_NAME = "webhook_events";

// Parse JSON payloads
app.use(bodyParser.json());

// Middleware to verify webhook signature
const verifyWebhookSignature = (req, res, next) => {
    const signature = req.headers["x-webhook-signature"];
    if (!signature) {
        return res.status(401).json({ error: "Missing signature header" });
    }

    // Calculate expected signature
    const payload = JSON.stringify(req.body);
    const computedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

    // Compare signatures securely
    if (
        crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computedSignature)
        )
    ) {
        next(); // Signature is valid, proceed
    } else {
        res.status(401).json({ error: "Invalid signature" });
    }
};

// Connect to MongoDB
let db;
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
    .then((client) => {
        db = client.db(DB_NAME);
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });

// Webhook endpoint
app.post("/webhook", verifyWebhookSignature, async (req, res) => {
    const webhookData = req.body;
    const eventId = webhookData.id;

    // Validate required fields
    if (
        !eventId ||
        !webhookData.amount ||
        !webhookData.currency ||
        !webhookData.created_at_time
    ) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    try {
        const collection = db.collection(COLLECTION_NAME);

        // Check for duplicate event (replay protection)
        const existingEvent = await collection.findOne({ eventId });
        if (existingEvent) {
            return res.status(200).json({ message: "Event already processed" });
        }

        // Store event ID to prevent future replays
        await collection.insertOne({ eventId, receivedAt: new Date() });

        // Process the transaction (e.g., log and store)
        const transactionDetails = {
            id: webhookData.id,
            amount: webhookData.amount,
            currency: webhookData.currency,
            full_name: webhookData.full_name,
            account_name: webhookData.account_name,
            created_at: new Date(webhookData.created_at_time * 1000), // Convert Unix timestamp
            invoice_url: webhookData.invoice_url,
        };

        // Store transaction (example processing)
        await db.collection("transactions").insertOne(transactionDetails);
        console.log("Processed transaction:", transactionDetails);

        // Respond to YaYa Wallet
        res.status(200).json({ message: "Webhook received successfully" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
