import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    appointment: Date
}, { timestamps: true });

export default mongoose.model("Visitor", visitorSchema);
