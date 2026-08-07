require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Server Running...");
});
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
console.log("Register Data:", req.body);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const newUser = new User({
      fullName,
      email,
      phone,
      password,
    });

    await newUser.save();

    res.status(201).json({
          user: newUser,
      message: "Account Created Successfully!",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});