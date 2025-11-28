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

// IMPORTANT — Required to serve HTML files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend (public folder)
app.use(express.static(path.join(__dirname, "public")));

// If user visits ANY unknown route → send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// DB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(()=> console.log("MongoDB Connected"))
  .catch(err=> console.log(err));

// SalesIQ webhook
app.post("/api/visitor", async (req, res)=>{
  try{
      const { name, email, phone, question, appointment } = req.body;

      if(appointment){
          const existing = await Visitor.findOne({ appointment });
          if(existing){
              return res.json({ success:false, message:"Time slot not available" });
          }
      }

      const visitor = new Visitor({ name, email, phone, question, appointment });
      await visitor.save();

      res.json({ success:true, message:"Details saved successfully" });

  } catch(err){
      res.status(500).json({ success:false, message:err.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
