import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Visitor from "./models/Visitor.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err=> console.log(err));

app.post("/api/visitor", async (req, res)=>{
    try{
        const { name, email, phone, question, appointment } = req.body;

        // Check appointment availability
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

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});
