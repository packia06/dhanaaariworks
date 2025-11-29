import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    question: String,
    appointment: String,
    service: String,  // service selected
    price: Number     // price per design
});

export default mongoose.model("Visitor", visitorSchema);
