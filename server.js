import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Visitor from "./models/Visitor.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Health route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Database connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// POST route from Zoho SalesIQ
app.post("/api/visitor", async (req, res) => {
  try {
    console.log("Webhook Incoming → ", req.body);

    const { name, email, phone, question, appointment } = req.body;

    if (appointment) {
      const existing = await Visitor.findOne({ appointment });
      if (existing) {
        return res.json({ success: false, message: "Time slot not available" });
      }
    }

    const visitor = new Visitor({ name, email, phone, question, appointment });
    await visitor.save();

    res.json({ success: true, message: "Saved successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
