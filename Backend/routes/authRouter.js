const express = require("express");
const yup = require("yup");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const emailjs = require("@emailjs/nodejs");

const User = require("../models/userSchema");

const authRouter = express.Router();

// ======================================================
// PASSWORD VALIDATION
// ======================================================

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

    // -----------------------------------------------
    // Confirm password
    // -----------------------------------------------

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }

    // -----------------------------------------------
    // Validate data
    // -----------------------------------------------

    const validatedData =
      await registerSchema.validate(
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
    // Check existing email
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

    const hashedPassword =
      await bcrypt.hash(
        validatedData.password,
        10
      );

    // -----------------------------------------------
    // Generate signup OTP
    // -----------------------------------------------

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // -----------------------------------------------
    // Create user
    // -----------------------------------------------

    const newUser = new User({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone,
      password: hashedPassword,

      resetOtp: otp,
      resetOtpExpires: otpExpires,

      otpReq: true,
      isVerified: false,

      otpPurpose: "signup",
    });

    const savedUser = await newUser.save();

    // -----------------------------------------------
    // Send signup OTP
    // -----------------------------------------------

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          subject: "Your OTP for Account Verification",
          email: savedUser.email,
          otp: otp,
          user_name: savedUser.fullName,
        },
        {
          publicKey:
            process.env.EMAILJS_PUBLIC_KEY,

          privateKey:
            process.env.EMAILJS_PRIVATE_KEY,
        }
      );
    } catch (emailError) {
      console.error(
        "Signup OTP email error:",
        emailError
      );

      return res.status(500).json({
        status: 500,
        message:
          "Account created, but we could not send the verification OTP. Please try again from login.",
      });
    }

    console.log(
      `Signup OTP generated for ${savedUser.email}: ${otp}`
    );

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(201).json({
      status: 201,
      message:
        "Account created successfully. OTP sent to your email.",
      email: savedUser.email,
      requiresVerification: true,
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        status: 409,
        message:
          "Email is already registered",
      });
    }

    return res.status(500).json({
      status: 500,
      message:
        "Internal server error",
    });
  }
});

// ======================================================
// LOGIN
// POST /auth/login
// ======================================================
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

    // -----------------------------------------------
    // Validate data
    // -----------------------------------------------

    const validatedData =
      await loginSchema.validate(
        {
          email,
          password,
        },
        {
          abortEarly: true,
        }
      );

    // -----------------------------------------------
    // Find user
    // -----------------------------------------------

    const user = await User.findOne({
      email: validatedData.email,
    });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message:
          "Invalid email or password",
      });
    }

    // -----------------------------------------------
    // Compare password
    // -----------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        validatedData.password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        status: 401,
        message:
          "Invalid email or password",
      });
    }

    // ==================================================
    // CHECK EMAIL VERIFICATION
    // ==================================================

    if (!user.isVerified) {

      // ---------------------------------------------
      // Check if existing OTP is still valid
      // ---------------------------------------------

      const existingOtpIsValid =
        user.otpReq === true &&
        user.resetOtp &&
        user.resetOtpExpires &&
        user.resetOtpExpires.getTime() >
          Date.now();

      let otp;

      if (existingOtpIsValid) {

        // Reuse existing OTP
        otp = user.resetOtp;

        console.log(
          `Using existing signup OTP for ${user.email}`
        );

      } else {

        // -------------------------------------------
        // Generate new OTP
        // -------------------------------------------

        otp = crypto
          .randomInt(
            100000,
            1000000
          )
          .toString();

        user.resetOtp = otp;

        user.resetOtpExpires =
          new Date(
            Date.now() + 5 * 60 * 1000
          );

        user.otpReq = true;
        user.isVerified = false;
        user.otpPurpose = "signup";

        await user.save();

        console.log(
          `Generated new signup OTP for ${user.email}: ${otp}`
        );
      }

      // ---------------------------------------------
      // Send OTP
      // ---------------------------------------------

      try {
        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_TEMPLATE_ID,
          {
            subject: "Your OTP for Account Verification",
            email: user.email,
            otp: otp,
            user_name: user.fullName,
          },
          {
            publicKey:
              process.env.EMAILJS_PUBLIC_KEY,

            privateKey:
              process.env.EMAILJS_PRIVATE_KEY,
          }
        );

      } catch (emailError) {

        console.error(
          "Login verification email error:",
          emailError
        );

        return res.status(500).json({
          status: 500,
          message:
            "Unable to send verification OTP",
        });
      }

      // ---------------------------------------------
      // Tell frontend verification is required
      // ---------------------------------------------

      return res.status(403).json({
        status: 403,

        message:
          "Please verify your email before logging in.",

        requiresVerification: true,

        email: user.email,
      });
    }

    // ==================================================
    // USER IS VERIFIED
    // ==================================================

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

    console.error(
      "Login error:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }

    return res.status(500).json({
      status: 500,
      message:
        "Internal server error",
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

    // ==================================================
    // VALIDATE EMAIL
    // ==================================================

    const validatedEmail = await yup
      .string()
      .email("Invalid email format")
      .required("Email is required")
      .trim()
      .lowercase()
      .validate(email);

    // ==================================================
    // FIND USER
    // ==================================================

    const user = await User.findOne({
      email: validatedEmail,
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Email is not registered",
      });
    }

    const now = Date.now();

    // ==================================================
    // CHECK 15-MINUTE COOLDOWN
    // ==================================================

    if (
      user.otpCooldownUntil &&
      user.otpCooldownUntil.getTime() > now
    ) {
      const remainingSeconds = Math.ceil(
        (user.otpCooldownUntil.getTime() - now) / 1000
      );

      return res.status(429).json({
        status: 429,
        message:
          "Too many OTP requests. Please try again later.",
        cooldownRemaining: remainingSeconds,
      });
    }

    // ==================================================
    // CLEAR EXPIRED COOLDOWN
    // ==================================================

    if (
      user.otpCooldownUntil &&
      user.otpCooldownUntil.getTime() <= now
    ) {
      user.otpCooldownUntil = null;
      user.otpRequestCount = 0;
      user.lastOtpRequestAt = null;

      await user.save();
    }

    // ==================================================
    // CHECK 60 SECOND RESEND LIMIT
    // ==================================================

    if (user.lastOtpRequestAt) {
      const secondsSinceLastRequest =
        (now - user.lastOtpRequestAt.getTime()) / 1000;

      if (secondsSinceLastRequest < 60) {
        const remainingSeconds = Math.ceil(
          60 - secondsSinceLastRequest
        );

        return res.status(429).json({
          status: 429,
          message:
            "Please wait before requesting another OTP.",
          cooldownRemaining: remainingSeconds,
        });
      }
    }

    // ==================================================
    // CHECK 5 OTP LIMIT
    // ==================================================

    if (user.otpRequestCount >= 5) {
      const cooldownUntil = new Date(
        now + 15 * 60 * 1000
      );

      user.otpCooldownUntil = cooldownUntil;

      await user.save();

      return res.status(429).json({
        status: 429,
        message:
          "You have reached the maximum number of OTP requests. Please try again in 15 minutes.",
        cooldownRemaining: 15 * 60,
      });
    }

    // ==================================================
    // CHECK EXISTING OTP
    // ==================================================

    const existingOtpIsValid =
      user.otpReq === true &&
      user.resetOtp &&
      user.resetOtpExpires &&
      user.resetOtpExpires.getTime() > now;

    let otp;

    if (existingOtpIsValid) {
      // ================================================
      // USE EXISTING OTP
      // ================================================

      otp = user.resetOtp;

      console.log(
        `Using existing OTP for ${validatedEmail}`
      );

    } else {
      // ================================================
      // GENERATE NEW OTP
      // ================================================

      otp = crypto
        .randomInt(100000, 1000000)
        .toString();

      const otpExpires = new Date(
        now + 5 * 60 * 1000
      );

      user.resetOtp = otp;
      user.resetOtpExpires = otpExpires;
      user.otpReq = true;
      user.isVerified = false;

      console.log(
        `Generated new OTP for ${validatedEmail}: ${otp}`
      );
    }

    // ==================================================
    // INCREMENT REQUEST COUNT
    // ==================================================

    user.otpRequestCount += 1;
    user.lastOtpRequestAt = new Date(now);

    // ==================================================
    // SAVE
    // ==================================================

    await user.save();

    // ==================================================
    // SEND EMAIL USING EMAILJS
    // ==================================================

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        email: validatedEmail,
        otp: otp,
        user_name: user.fullName,
      },
      {
        publicKey:
          process.env.EMAILJS_PUBLIC_KEY,

        privateKey:
          process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      status: 200,
      message: "OTP sent to your email successfully",

      email: validatedEmail,

      // Frontend uses this to start 60 second timer
      resendCooldown: 60,

      // How many requests remain
      remainingRequests:
        5 - user.otpRequestCount,
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Unable to send OTP",
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

    // -----------------------------------------------
    // Validate input
    // -----------------------------------------------

    if (!email || !otp) {
      return res.status(400).json({
        status: 400,
        message: "Email and OTP are required",
      });
    }

    // -----------------------------------------------
    // Find user
    // -----------------------------------------------

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // -----------------------------------------------
    // Check if OTP was requested
    // -----------------------------------------------

    if (!user.otpReq) {
      return res.status(401).json({
        status: 401,
        message:
          "No OTP request found. Please request a new OTP.",
      });
    }

    // -----------------------------------------------
    // Check OTP exists
    // -----------------------------------------------

    if (!user.resetOtp) {
      return res.status(401).json({
        status: 401,
        message:
          "No OTP found. Please request a new OTP.",
      });
    }

    // -----------------------------------------------
    // Check OTP expiry
    // -----------------------------------------------

    if (
      !user.resetOtpExpires ||
      user.resetOtpExpires.getTime() < Date.now()
    ) {
      // Clear expired OTP
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.otpReq = false;
      user.otpPurpose = null;
      user.isVerified = false;

      await user.save();

      return res.status(401).json({
        status: 401,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // -----------------------------------------------
    // Compare OTP
    // -----------------------------------------------

    if (user.resetOtp !== otp.toString()) {
      return res.status(401).json({
        status: 401,
        message: "Invalid OTP",
      });
    }

    // ==================================================
    // OTP IS CORRECT
    // ==================================================

    const purpose = user.otpPurpose;

    // -----------------------------------------------
    // Mark OTP as verified
    // -----------------------------------------------

    user.isVerified = true;

    // -----------------------------------------------
    // OTP cannot be reused
    // -----------------------------------------------

    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.otpReq = false;
    user.otpPurpose = null;

    // -----------------------------------------------
    // Reset OTP request limits
    // -----------------------------------------------

    user.otpRequestCount = 0;
    user.lastOtpRequestAt = null;
    user.otpCooldownUntil = null;

    await user.save();

    // ==================================================
    // SIGNUP VERIFICATION
    // ==================================================

    if (purpose === "signup") {
      return res.status(200).json({
        status: 200,

        message:
          "Email verified successfully. You can now login.",

        verified: true,

        purpose: "signup",

        email: user.email,
      });
    }

    // ==================================================
    // PASSWORD RESET VERIFICATION
    // ==================================================

    return res.status(200).json({
      status: 200,

      message:
        "OTP verified successfully",

      verified: true,

      purpose: "reset",

      email: user.email,
    });

  } catch (error) {

    console.error(
      "OTP verification error:",
      error
    );

    return res.status(500).json({
      status: 500,
      message:
        "Internal server error",
    });
  }
});

// ======================================================
// RESET PASSWORD
// POST /auth/reset-password
// ======================================================

authRouter.post(
  "/reset-password",
  async (req, res) => {

    try {

      const {
        email,
        password,
        confirmPassword,
      } = req.body;

      // -----------------------------------------------
      // Required fields
      // -----------------------------------------------

      if (
        !email ||
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          status: 400,
          message:
            "All fields are required",
        });
      }

      // -----------------------------------------------
      // Confirm password
      // -----------------------------------------------

      if (
        password !== confirmPassword
      ) {
        return res.status(400).json({
          status: 400,
          message:
            "Passwords do not match",
        });
      }

      // -----------------------------------------------
      // Validate password
      // -----------------------------------------------

      const validatedPassword =
        await passwordSchema.validate(
          password
        );

      // -----------------------------------------------
      // Find user
      // -----------------------------------------------

      const user = await User.findOne({
        email:
          email.trim().toLowerCase(),
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      // -----------------------------------------------
      // Check OTP verification
      // -----------------------------------------------

      if (!user.isVerified) {
        return res.status(401).json({
          status: 401,
          message:
            "Please verify OTP first",
        });
      }

      // -----------------------------------------------
      // Hash password
      // -----------------------------------------------

      const hashedPassword =
        await bcrypt.hash(
          validatedPassword,
          10
        );

      // -----------------------------------------------
      // Update password
      // -----------------------------------------------

      user.password = hashedPassword;

      // -----------------------------------------------
      // Clear reset state
      // -----------------------------------------------

      user.resetOtp = null;

      user.resetOtpExpires = null;

      user.otpReq = false;

      user.isVerified = false;

      await user.save();

      // -----------------------------------------------
      // Success
      // -----------------------------------------------

      return res.status(200).json({
        status: 200,

        message:
          "Password reset successfully",
      });

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          status: 400,
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 500,
        message:
          "Internal server error",
      });
    }
  }
);

module.exports = authRouter;