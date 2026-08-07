const mongoose = require("mongoose");

// 1. Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/mini-crm")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("Database connection error:", err));

// 2. Define the Mongoose Schema matching your route
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt fields

// 3. Create the Model
const User = mongoose.model("User", userSchema);

module.exports = User;
