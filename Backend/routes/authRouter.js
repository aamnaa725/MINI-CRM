const express = require("express");
const yup = require("yup");
const bcrypt = require("bcrypt");

const User = require("../models/userSchema");

const authRouter = express.Router();


// =====================================================
// REGISTER VALIDATION
// =====================================================

const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Full Name is required")
    .trim()
    .min(2, "Full Name must be at least 2 characters")
    .max(50, "Full Name cannot exceed 50 characters"),

  email: yup
    .string()
    .required("Email is required")
    .trim()
    .lowercase()
    .email("Invalid email format"),

  phone: yup
    .string()
    .required("Phone number is required")
    .trim()
    .matches(
      /^\+?[0-9\s-]{10,15}$/,
      "Enter a valid phone number"
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .matches(
      /[A-Z]/,
      "Password must contain at least one uppercase letter"
    )
    .matches(
      /[a-z]/,
      "Password must contain at least one lowercase letter"
    )
    .matches(
      /[0-9]/,
      "Password must contain at least one number"
    )
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});


// =====================================================
// POST /auth/register
// =====================================================

authRouter.post("/register", async (req, res) => {
  try {

    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;


    // -----------------------------------------------
    // Check password confirmation
    // -----------------------------------------------

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }


    // -----------------------------------------------
    // Validate registration data
    // -----------------------------------------------

    const validatedData = await registerSchema.validate(
      {
        fullName,
        email,
        phone,
        password,
      },
      {
        abortEarly: true,
      }
    );


    // -----------------------------------------------
    // Check if email already exists
    // -----------------------------------------------

    const existingUser = await User.findOne({
      email: validatedData.email,
    });

    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Email is already registered",
      });
    }


    // -----------------------------------------------
    // Hash password
    // -----------------------------------------------

    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      10
    );


    // -----------------------------------------------
    // Create new user
    // -----------------------------------------------

    const newUser = new User({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone,
      password: hashedPassword,
    });


    const savedUser = await newUser.save();


    // -----------------------------------------------
    // Registration successful
    // -----------------------------------------------

    return res.status(201).json({
      status: 201,
      message: "User Created Successfully",

      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
      },
    });

  } catch (error) {

    console.error("Registration error:", error);


    // Yup validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }


    // MongoDB duplicate email protection
    if (error.code === 11000) {
      return res.status(409).json({
        status: 409,
        message: "Email is already registered",
      });
    }


    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});


// =====================================================
// LOGIN VALIDATION
// =====================================================

const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .trim()
    .lowercase()
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required"),
});


// =====================================================
// POST /auth/login
// =====================================================

authRouter.post("/login", async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // -----------------------------------------------
    // Validate login data
    // -----------------------------------------------

    const validatedData = await loginSchema.validate(
      {
        email,
        password,
      },
      {
        abortEarly: true,
      }
    );


    // -----------------------------------------------
    // Find user by email
    // -----------------------------------------------

    const user = await User.findOne({
      email: validatedData.email,
    });


    // Don't reveal whether email exists
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }


    // -----------------------------------------------
    // Compare password
    // -----------------------------------------------

    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password
    );


    if (!passwordMatch) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }


    // -----------------------------------------------
    // Login successful
    // -----------------------------------------------

    return res.status(200).json({
      status: 200,
      message: "Login successful",

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {

    console.error("Login error:", error);


    // Yup validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }


    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});


module.exports = authRouter;