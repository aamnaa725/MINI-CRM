const express = require("express");
const crypto = require("crypto");
const yup = require("yup");
const bcrypt = require("bcrypt");
const emailjs = require('@emailjs/nodejs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const User = require("../models/userSchema");

const authRouter = express.Router();
require("dotenv").config();


authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));
// ======================================================
// PASSWORD VALIDATION
// ======================================================

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});


const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
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
  );

// ======================================================
// REGISTER VALIDATION
// ======================================================

const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Full Name is required")
    .trim(),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .trim()
    .lowercase(),

  phone: yup
    .string()
    .required("Phone number is required")
    .trim(),

  password: passwordSchema,
});

// ======================================================
// LOGIN VALIDATION
// ======================================================

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .trim()
    .lowercase(),

  password: yup
    .string()
    .required("Password is required"),
});

// ======================================================
// REGISTER
// POST /auth/register
// ======================================================

authRouter.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    // Check confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }

    // Validate data
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

    // Check existing email
    const existingUser = await User.findOne({
      email: validatedData.email,
    });

    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      10
    );

    // Create user
    const newUser = new User({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

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

// ======================================================
// LOGIN
// POST /auth/login
// ======================================================

authRouter.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const validatedData = await loginSchema.validate(
      {
        email,
        password,
      },
      {
        abortEarly: true,
      }
    );

    // Find user
    const user = await User.findOne({
      email: validatedData.email,
    });


    const userCopy = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      sessions: []
    }
    const options = {
      expiresIn: '1h' // Options include: '24h', '7d', '15m'
    };

    const secretKey = process.env.JWT_SECRET_CODE;
    const token = jwt.sign(userCopy, secretKey, options);
    userCopy.sessions.push(token);





    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }

    // Compare password
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

    try {
      const updatedUserFromDB = await User.findByIdAndUpdate(userCopy._id, userCopy, { new: true })
      return res.status(200).json({
        status: 200,
        message: "Login successful",
        user: updatedUserFromDB
      });
    } catch (e) {
      return res.status(401).json({
        status: 402,
        message: e,
      });
    }

  } catch (error) {
    console.error("Login error:", error);

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

// ======================================================
// FORGOT PASSWORD
// POST /auth/forgot-password
// ======================================================

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const validatedEmail = await yup
      .string()
      .email("Invalid email format")
      .required("Email is required")
      .trim()
      .lowercase()
      .validate(email);

    // Find user
    const user = await User.findOne({
      email: validatedEmail,
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Email is not registered",
      });
    }

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // OTP expires after 5 minutes
    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Save OTP
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    user.otpVerified = false;

    await user.save();

    // console.log(
    //   `Generated OTP for ${validatedEmail}: ${otp}`
    // );

    const templateParams = {
      OTP_CODE: otp,
      EXPIRY_MINUTES: 5,
      email
    }

    emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParams)
      .then((response) => {
        // console.log('SUCCESS!', response.status, response.text);
      })
      .catch((err) => {
        console.error('FAILED...', err);
      });


    return res.status(200).json({
      status: 200,
      message: "OTP generated successfully",

      // Remove this in production
      otp: otp,

      email: validatedEmail,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

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

// ======================================================
// VERIFY OTP
// POST /auth/verify-otp
// ======================================================

authRouter.post("/verify-otp", async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        status: 400,
        message: "Email and OTP are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Check OTP exists
    if (!user.resetOtp) {
      return res.status(401).json({
        status: 401,
        message: "No OTP found. Please request a new OTP",
      });
    }

    // Check OTP expiry
    if (
      !user.resetOtpExpires ||
      user.resetOtpExpires.getTime() < Date.now()
    ) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.otpVerified = false;

      await user.save();

      return res.status(401).json({
        status: 401,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // Compare OTP
    if (user.resetOtp !== otp.toString()) {
      return res.status(401).json({
        status: 401,
        message: "Invalid OTP",
      });
    }

    // OTP correct
    user.otpVerified = true;

    await user.save();

    return res.status(200).json({
      status: 200,
      message: "OTP verified successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

// ======================================================
// RESET PASSWORD
// POST /auth/reset-password
// ======================================================

authRouter.post("/reset-password", async (req, res) => {
  try {
    const {
      email,
      password,
      confirmPassword,
    } = req.body;

    // Check passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }

    // Validate password
    const validatedPassword = await passwordSchema.validate(
      password
    );

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Make sure OTP was verified
    if (!user.otpVerified) {
      return res.status(401).json({
        status: 401,
        message: "Please verify OTP first",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      validatedPassword,
      10
    );

    // Update password
    user.password = hashedPassword;

    // Clear OTP information
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.otpVerified = false;

    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

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


authRouter.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token && token.length <= 0) {
      res.status(401).json({
        status: 401,
        message: "Token Expired"
      });
    }

    const isInDataBase = await User.findOne({sessions: token})
    if (isInDataBase.sessions === undefined) {
      res.status(401).json({
        status: 401,
        message: "Token Expired"
      });
    }

    const response = verifyToken(token);
    // console.log(response);

    res.json({
      status: 200,
      message: "Token is Valid"
    });
    return;
  } catch (e) {
    if (e.message === "jwt malformed") {
      res.status(401).json({
        status: 401,
        message: "Token Expired"
      });
    } else {
      res.status(401).json({
        status: 401,
        message: "Token Expired"
      });
    }
  }
})

const verifyToken = (token) => {
  return jwt.verify(
    token, process.env.JWT_SECRET_CODE
  );
}

authRouter.post("/logout", async (req, res) => {
  let token = req.headers.authorization;
  token = token.split(" ")[1];
  const session = await User.findOneAndUpdate({ sessions: token }, {
    $set: {
      sessions: [],
    },
  }, { new: true });
  // console.log(session);

  res.status(200).json({
    status: 200,
    message: "Logged out successfully"
  });
})

module.exports = authRouter;