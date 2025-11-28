import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Visitor from "./models/Visitor.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// -------------------- API Routes --------------------

// Health check (optional)
app.get("/health", (req, res) => {
  res.json({ status: "Server is running!" });
});

// Visitor data POST route (SalesIQ webhook)
app.post("/api/visitor", async (req, res) => {
  try {
    const { name, email, phone, question, appointment } = req.body;

    // Appointment availability check
    if (appointment) {
      const existing = await Visitor.findOne({ appointment });
      if (existing) {
        return res.json({
          success: false,
          message: "Time slot not available",
        });
      }
    }

    const visitor = new Visitor({ name, email, phone, question, appointment });
    await visitor.save();

    res.json({ success: true, message: "Details saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- MongoDB Connection --------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// -------------------- Fallback Route for Frontend --------------------
// This will serve index.html for all routes not matched above (for SPA/HTML)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
