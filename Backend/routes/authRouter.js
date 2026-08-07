// routes/users.js
const express = require("express");
const authRouter = express.Router(); // Create a new router instance
const yup = require("yup");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");

const userSchema = yup.object({
  fullName: yup.string().required("Full Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup.number().optional(),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

// This matches the base path "/" relative to where it is mounted
authRouter.post("/register", async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const user = {
    fullName,
    email,
    phone,
    password,
  };
  try {
    const validation = await userSchema.validate(user);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    user.password = hashedPassword;

    const userDataFromDB = new User(user);
    const response = await userDataFromDB.save();

    res.status(201).send({
      status: 201,
      message: "User Created Successfully",
      user: response,
    });
  } catch (e) {
    res.status(400).send({
      status: 400,
      message: e,
    });
  }
});

// This matches "/profile" relative to the base path
// authRouter.get('/profile', (req, res) => {
//     res.send('User profile data');
// });

module.exports = authRouter;
