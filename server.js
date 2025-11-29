import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Visitor from "./models/Visitor.js";

dotenv.config();

const app = express();

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Parse JSON body
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Health route
app.get("/health", (req, res) => {
    res.send("Server is running!");
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// POST webhook for Zoho SalesIQ
app.post("/api/visitor", async (req, res) => {
    try {
        console.log("Webhook Incoming → ", req.body);

        const { name, email, phone, question, appointment } = req.body;

        // Check if appointment is already booked
        if(appointment){
            const existing = await Visitor.findOne({ appointment });
            if(existing){
                return res.json({ success: false, message: "Time slot not available" });
            }
        }

        // Save visitor async, respond immediately
        const visitor = new Visitor({ name, email, phone, question, appointment });
        visitor.save().catch(err => console.log("MongoDB save error:", err));

        // Send fast response to Zoho
        res.json({ success: true, message: "Details received successfully" });

    } catch(err) {
        console.log("Webhook error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Catch-all route for SPA frontend
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
