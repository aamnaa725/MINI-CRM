const express = require("express");
const yup = require("yup");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const emailjs = require("@emailjs/nodejs");
const jwt = require("jsonwebtoken");

const User = require("../models/userSchema");

const authRouter = express.Router();

// ======================================================
// EMAILJS CONFIGURATION
// ======================================================

const EMAILJS_SERVICE_ID =
  process.env.EMAILJS_SERVICE_ID;

const EMAILJS_TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_ID;

const EMAILJS_PUBLIC_KEY =
  process.env.EMAILJS_PUBLIC_KEY;

const EMAILJS_PRIVATE_KEY =
  process.env.EMAILJS_PRIVATE_KEY;

// ======================================================
// OTP SETTINGS
// ======================================================

const OTP_EXPIRY_MINUTES = 10;

const MAX_OTP_RESENDS = 5;

const OTP_BLOCK_MINUTES = 10;

const OTP_RESEND_COOLDOWN_SECONDS = 60;

const MAX_OTP_ATTEMPTS = 5;

// ======================================================
// RESET TOKEN SETTINGS
// ======================================================

const RESET_TOKEN_EXPIRY_MINUTES = 10;

// ======================================================
// OTP HELPERS
// ======================================================

const generateOtp = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};

const getOtpExpiry = () => {
  return new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES * 60 * 1000
  );
};

// ======================================================
// RESET TOKEN HELPERS
// ======================================================

const generateSecureToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const getResetTokenExpiry = () => {
  return new Date(
    Date.now() +
      RESET_TOKEN_EXPIRY_MINUTES *
        60 *
        1000
  );
};

// ======================================================
// RESET COOKIE OPTIONS
// ======================================================

const getResetCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction
      ? "none"
      : "lax",

    maxAge:
      RESET_TOKEN_EXPIRY_MINUTES *
      60 *
      1000,

    path: "/",
  };
};

// ======================================================
// ACCESS TOKEN COOKIE OPTIONS
// ======================================================

const getAccessTokenCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction
      ? "none"
      : "lax",

    // JWT cookie expires after 1 hour
    maxAge: 60 * 60 * 1000,

    path: "/",
  };
};

// ======================================================
// OTP LONG-TERM RATE LIMIT
// ======================================================

const checkOtpRateLimit = (user) => {
  const now = new Date();

  // ----------------------------------------------
  // User currently blocked
  // ----------------------------------------------

  if (
    user.otpResendBlockedUntil &&
    now < user.otpResendBlockedUntil
  ) {
    const remainingMs =
      user.otpResendBlockedUntil.getTime() -
      now.getTime();

    const remainingMinutes =
      Math.ceil(
        remainingMs / 60000
      );

    return {
      allowed: false,

      message:
        `Too many OTP requests. Please wait ${remainingMinutes} minute${
          remainingMinutes === 1
            ? ""
            : "s"
        } before requesting another OTP.`,
    };
  }

  // ----------------------------------------------
  // Block expired
  // ----------------------------------------------

  if (
    user.otpResendBlockedUntil &&
    now >= user.otpResendBlockedUntil
  ) {
    user.otpResendBlockedUntil = null;

    user.otpResendCount = 0;

    user.otpResendWindowStartedAt =
      null;
  }

  return {
    allowed: true,
  };
};

// ======================================================
// 60 SECOND SERVER-SIDE COOLDOWN
// ======================================================

const checkResendCooldown = (user) => {
  const now = new Date();

  if (
    user.otpResendAvailableAt &&
    now < user.otpResendAvailableAt
  ) {
    const remainingMs =
      user.otpResendAvailableAt.getTime() -
      now.getTime();

    const remainingSeconds =
      Math.ceil(
        remainingMs / 1000
      );

    return {
      allowed: false,
      remainingSeconds,
    };
  }

  return {
    allowed: true,
    remainingSeconds: 0,
  };
};

// ======================================================
// SEND OTP EMAIL
// ======================================================

const sendOtpEmail = async (
  email,
  otp,
  fullName = "User"
) => {
  if (
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_TEMPLATE_ID ||
    !EMAILJS_PUBLIC_KEY
  ) {
    throw new Error(
      "EmailJS environment variables are missing."
    );
  }

  const templateParams = {
    to_email: email,

    email: email,

    name: fullName,

    otp: otp,

    message:
      `Your Mini CRM verification code is ${otp}. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  };

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey:
        EMAILJS_PUBLIC_KEY,

      ...(EMAILJS_PRIVATE_KEY
        ? {
            privateKey:
              EMAILJS_PRIVATE_KEY,
          }
        : {}),
    }
  );
};

// ======================================================
// ISSUE OTP
// ======================================================

const issueOtp = async (user) => {
  // ----------------------------------------------
  // Long-term rate limit
  // ----------------------------------------------

  const rateLimit =
    checkOtpRateLimit(user);

  if (!rateLimit.allowed) {
    const error =
      new Error(rateLimit.message);

    error.code =
      "OTP_RATE_LIMIT";

    throw error;
  }

  // ----------------------------------------------
  // 60 second cooldown
  // ----------------------------------------------

  const cooldown =
    checkResendCooldown(user);

  if (!cooldown.allowed) {
    const error =
      new Error(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting another OTP.`
      );

    error.code =
      "OTP_COOLDOWN";

    error.remainingSeconds =
      cooldown.remainingSeconds;

    throw error;
  }

  // ----------------------------------------------
  // Generate OTP
  // ----------------------------------------------

  const otp =
    generateOtp();

  const otpHash =
    hashOtp(otp);

  const otpExpires =
    getOtpExpiry();

  // ----------------------------------------------
  // Store HASHED OTP
  // ----------------------------------------------

  user.resetOtp =
    otpHash;

  user.resetOtpExpires =
    otpExpires;

  user.otpAttempts = 0;

  // ----------------------------------------------
  // Server-side 60 second cooldown
  // ----------------------------------------------

  user.otpResendAvailableAt =
    new Date(
      Date.now() +
        OTP_RESEND_COOLDOWN_SECONDS *
          1000
    );

  await user.save();

  // ----------------------------------------------
  // Send actual OTP by email
  // ----------------------------------------------

  try {
    await sendOtpEmail(
      user.email,
      otp,
      user.fullName
    );
  } catch (error) {
    // Don't leave a valid OTP active
    // if email delivery fails.

    user.resetOtp = null;

    user.resetOtpExpires =
      null;

    user.otpAttempts = 0;

    user.otpResendAvailableAt =
      null;

    await user.save();

    throw error;
  }

  return {
    otpExpires,

    resendAvailableAt:
      user.otpResendAvailableAt,
  };
};

// ======================================================
// PASSWORD RULES
// ======================================================

const passwordRules = yup
  .string()
  .required(
    "Password is required"
  )
  .min(
    8,
    "Password must be at least 8 characters"
  )
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
// VALIDATION
// ======================================================

const registerSchema = yup.object({
  fullName: yup
    .string()
    .required(
      "Full Name is required"
    )
    .trim(),

  email: yup
    .string()
    .email(
      "Invalid email format"
    )
    .required(
      "Email is required"
    )
    .trim()
    .lowercase(),

  phone: yup
    .string()
    .required(
      "Phone number is required"
    )
    .trim(),

  password:
    passwordRules,

  confirmPassword: yup
    .string()
    .required(
      "Confirm Password is required"
    )
    .oneOf(
      [yup.ref("password")],
      "Passwords do not match"
    ),
});

const loginSchema = yup.object({
  email: yup
    .string()
    .email(
      "Invalid email format"
    )
    .required(
      "Email is required"
    )
    .trim()
    .lowercase(),

  password: yup
    .string()
    .required(
      "Password is required"
    ),
});

const resetPasswordSchema =
  yup.object({
    password:
      passwordRules,

    confirmPassword: yup
      .string()
      .required(
        "Confirm Password is required"
      )
      .oneOf(
        [yup.ref("password")],
        "Passwords do not match"
      ),
  });

// ======================================================
// REGISTER
// ======================================================

authRouter.post(
  "/register",
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      } = req.body;

      const validatedData =
        await registerSchema.validate(
          {
            fullName,
            email,
            phone,
            password,
            confirmPassword,
          },
          {
            abortEarly: true,
          }
        );

      const existingUser =
        await User.findOne({
          email:
            validatedData.email,
        });

      // ----------------------------------------------
      // Existing account
      // ----------------------------------------------

      if (existingUser) {
        if (
          existingUser.otpVerified ===
          false
        ) {
          try {
            const otpResult =
              await issueOtp(
                existingUser
              );

            return res
              .status(200)
              .json({
                status: 200,

                message:
                  "Your account is not verified. A new OTP has been sent.",

                email:
                  existingUser.email,

                requiresVerification:
                  true,

                resendAvailableAt:
                  otpResult.resendAvailableAt,
              });
          } catch (error) {
            if (
              error.code ===
              "OTP_RATE_LIMIT"
            ) {
              return res
                .status(429)
                .json({
                  status: 429,

                  message:
                    error.message,
                });
            }

            if (
              error.code ===
              "OTP_COOLDOWN"
            ) {
              return res
                .status(429)
                .json({
                  status: 429,

                  message:
                    error.message,

                  remainingSeconds:
                    error.remainingSeconds,

                  resendAvailableAt:
                    existingUser.otpResendAvailableAt,
                });
            }

            throw error;
          }
        }

        return res
          .status(409)
          .json({
            status: 409,

            message:
              "Email is already registered.",
          });
      }

      // ----------------------------------------------
      // Hash password
      // ----------------------------------------------

      const hashedPassword =
        await bcrypt.hash(
          validatedData.password,
          10
        );

      // ----------------------------------------------
      // Create user
      // ----------------------------------------------

      const newUser =
        new User({
          fullName:
            validatedData.fullName,

          email:
            validatedData.email,

          phone:
            validatedData.phone,

          password:
            hashedPassword,

          otpVerified: false,

          resetPasswordVerified:
            false,

          resetPasswordVerifiedAt:
            null,

          otpResendCount: 0,

          otpResendWindowStartedAt:
            new Date(),

          otpResendBlockedUntil:
            null,

          otpResendAvailableAt:
            null,

          otpAttempts: 0,

          resetPasswordTokenHash:
            null,

          resetPasswordTokenExpires:
            null,

          resetOtp: null,

          resetOtpExpires: null,
        });

      await newUser.save();

      // ----------------------------------------------
      // Send initial OTP
      // ----------------------------------------------

      try {
        const otpResult =
          await issueOtp(
            newUser
          );

        return res
          .status(201)
          .json({
            status: 201,

            message:
              "Account created successfully. OTP sent to your email.",

            email:
              newUser.email,

            requiresVerification:
              true,

            resendAvailableAt:
              otpResult.resendAvailableAt,
          });
      } catch (emailError) {
        console.error(
          "EmailJS error:",
          emailError
        );

        await User.findByIdAndDelete(
          newUser._id
        );

        if (
          emailError.code ===
          "OTP_RATE_LIMIT"
        ) {
          return res
            .status(429)
            .json({
              status: 429,

              message:
                emailError.message,
            });
        }

        if (
          emailError.code ===
          "OTP_COOLDOWN"
        ) {
          return res
            .status(429)
            .json({
              status: 429,

              message:
                emailError.message,

              remainingSeconds:
                emailError.remainingSeconds,
            });
        }

        return res
          .status(500)
          .json({
            status: 500,

            message:
              "Unable to send verification OTP. Please try again.",
          });
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              error.message,
          });
      }

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Internal server error.",
        });
    }
  }
);

// ======================================================
// VERIFY SIGNUP OTP
// ======================================================

authRouter.post(
  "/verify-otp",
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Email and OTP are required.",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const cleanOtp =
        String(otp).trim();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            status: 404,

            message:
              "User not found.",
          });
      }

      if (user.otpVerified) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Account is already verified.",
          });
      }

      if (
        !user.resetOtp ||
        !user.resetOtpExpires
      ) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "No active OTP. Please request a new OTP.",
          });
      }

      // ----------------------------------------------
      // Expired OTP
      // ----------------------------------------------

      if (
        new Date() >
        user.resetOtpExpires
      ) {
        user.resetOtp = null;

        user.resetOtpExpires =
          null;

        user.otpAttempts = 0;

        await user.save();

        return res
          .status(400)
          .json({
            status: 400,

            message:
              "OTP has expired. Please request a new OTP.",
          });
      }

      // ----------------------------------------------
      // Attempt limit
      // ----------------------------------------------

      if (
        (user.otpAttempts || 0) >=
        MAX_OTP_ATTEMPTS
      ) {
        user.resetOtp = null;

        user.resetOtpExpires =
          null;

        user.otpAttempts = 0;

        await user.save();

        return res
          .status(429)
          .json({
            status: 429,

            message:
              "Too many incorrect OTP attempts. Please request a new OTP.",
          });
      }

      // ----------------------------------------------
      // Compare hashed OTP
      // ----------------------------------------------

      const submittedOtpHash =
        hashOtp(cleanOtp);

      if (
        user.resetOtp !==
        submittedOtpHash
      ) {
        user.otpAttempts =
          (user.otpAttempts || 0) +
          1;

        const remainingAttempts =
          MAX_OTP_ATTEMPTS -
          user.otpAttempts;

        if (
          user.otpAttempts >=
          MAX_OTP_ATTEMPTS
        ) {
          user.resetOtp = null;

          user.resetOtpExpires =
            null;

          user.otpAttempts = 0;

          await user.save();

          return res
            .status(429)
            .json({
              status: 429,

              message:
                "Too many incorrect OTP attempts. Please request a new OTP.",
            });
        }

        await user.save();

        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Invalid OTP.",

            remainingAttempts,
          });
      }

      // ----------------------------------------------
      // Account verified
      // ----------------------------------------------

      user.otpVerified =
        true;

      user.resetOtp = null;

      user.resetOtpExpires =
        null;

      user.otpAttempts = 0;

      user.resetPasswordVerified =
        false;

      user.resetPasswordVerifiedAt =
        null;

      user.otpResendCount = 0;

      user.otpResendWindowStartedAt =
        null;

      user.otpResendBlockedUntil =
        null;

      user.otpResendAvailableAt =
        null;

      await user.save();

      return res
        .status(200)
        .json({
          status: 200,

          message:
            "Email verified successfully.",

          verified: true,
        });
    } catch (error) {
      console.error(
        "Signup OTP verification error:",
        error
      );

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Internal server error.",
        });
    }
  }
);

// ======================================================
// RESEND SIGNUP OTP
// ======================================================

authRouter.post(
  "/resend-otp",
  async (req, res) => {
    try {
      const { email } =
        req.body;

      if (!email) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Email is required.",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            status: 404,

            message:
              "User not found.",
          });
      }

      if (user.otpVerified) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Account is already verified.",
          });
      }

      // ----------------------------------------------
      // 60 second server-side check
      // ----------------------------------------------

      const cooldown =
        checkResendCooldown(
          user
        );

      if (!cooldown.allowed) {
        return res
          .status(429)
          .json({
            status: 429,

            message:
              `Please wait ${cooldown.remainingSeconds} seconds before requesting another OTP.`,

            remainingSeconds:
              cooldown.remainingSeconds,

            resendAvailableAt:
              user.otpResendAvailableAt,
          });
      }

      // ----------------------------------------------
      // Long-term rate limit
      // ----------------------------------------------

      const rateLimit =
        checkOtpRateLimit(
          user
        );

      if (!rateLimit.allowed) {
        await user.save();

        return res
          .status(429)
          .json({
            status: 429,

            message:
              rateLimit.message,
          });
      }

      // ----------------------------------------------
      // Count resend
      // ----------------------------------------------

      user.otpResendCount =
        (user.otpResendCount || 0) +
        1;

      if (
        !user.otpResendWindowStartedAt
      ) {
        user.otpResendWindowStartedAt =
          new Date();
      }

      if (
        user.otpResendCount >=
        MAX_OTP_RESENDS
      ) {
        user.otpResendBlockedUntil =
          new Date(
            Date.now() +
              OTP_BLOCK_MINUTES *
                60 *
                1000
          );
      }

      // Clear any previous OTP before issuing a new one
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.otpAttempts = 0;

      // ----------------------------------------------
      // Generate new OTP
      // ----------------------------------------------

      const otp = generateOtp();
      const otpHash = hashOtp(otp);

      user.resetOtp =
        otpHash;

      user.resetOtpExpires =
        getOtpExpiry();

      user.otpAttempts = 0;

      user.otpResendAvailableAt =
        new Date(
          Date.now() +
            OTP_RESEND_COOLDOWN_SECONDS *
              1000
        );

      await user.save();

      // ----------------------------------------------
      // Send email
      // ----------------------------------------------

      try {
        await sendOtpEmail(
          user.email,
          otp,
          user.fullName
        );
      } catch (emailError) {
        console.error(
          "EmailJS resend error:",
          emailError
        );

        user.resetOtp = null;

        user.resetOtpExpires =
          null;

        user.otpAttempts = 0;

        user.otpResendAvailableAt =
          null;

        await user.save();

        return res
          .status(500)
          .json({
            status: 500,

            message:
              "Unable to send OTP.",
          });
      }

      return res
        .status(200)
        .json({
          status: 200,

          message:
            "A new OTP has been sent.",

          email:
            user.email,

          resendAvailableAt:
            user.otpResendAvailableAt,
        });
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Unable to resend OTP.",
        });
    }
  }
);

// ======================================================
// LOGIN
// ======================================================

authRouter.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

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

      const user =
        await User.findOne({
          email:
            validatedData.email,
        });

      // ----------------------------------------------
      // User not found
      // ----------------------------------------------

      if (!user) {
        return res
          .status(401)
          .json({
            status: 401,

            message:
              "Invalid email or password.",
          });
      }

      // ----------------------------------------------
      // Check password
      // ----------------------------------------------

      const passwordMatch =
        await bcrypt.compare(
          validatedData.password,
          user.password
        );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({
            status: 401,

            message:
              "Invalid email or password.",
          });
      }

      // ----------------------------------------------
      // Unverified user
      // ----------------------------------------------

      if (!user.otpVerified) {
        try {
          const now =
            new Date();

          const otpStillValid =
            user.resetOtp &&
            user.resetOtpExpires &&
            now <
              user.resetOtpExpires;

          if (!otpStillValid) {
            await issueOtp(
              user
            );
          }
        } catch (otpError) {
          if (
            otpError.code ===
            "OTP_RATE_LIMIT"
          ) {
            return res
              .status(429)
              .json({
                status: 429,

                message:
                  otpError.message,

                requiresVerification:
                  true,

                email:
                  user.email,
              });
          }

          if (
            otpError.code ===
            "OTP_COOLDOWN"
          ) {
            return res
              .status(429)
              .json({
                status: 429,

                message:
                  otpError.message,

                remainingSeconds:
                  otpError.remainingSeconds,

                requiresVerification:
                  true,

                email:
                  user.email,

                resendAvailableAt:
                  user.otpResendAvailableAt,
              });
          }

          return res
            .status(500)
            .json({
              status: 500,

              message:
                "Unable to send verification OTP.",
            });
        }

        return res
          .status(403)
          .json({
            status: 403,

            message:
              "Please verify your email before logging in.",

            requiresVerification:
              true,

            email:
              user.email,

            resendAvailableAt:
              user.otpResendAvailableAt,
          });
      }

      // ----------------------------------------------
      // JWT SECRET CHECK
      // ----------------------------------------------

      if (!process.env.JWT_SECRET) {
        console.error(
          "❌ JWT_SECRET is missing from .env"
        );

        return res
          .status(500)
          .json({
            status: 500,

            message:
              "Authentication configuration error.",
          });
      }

      // ----------------------------------------------
      // Generate JWT
      // ----------------------------------------------

      const token =
        jwt.sign(
          {
            userId:
              user._id.toString(),

            email:
              user.email,
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              process.env.JWT_EXPIRES_IN ||
              "1h",
          }
        );

      // ----------------------------------------------
      // Store JWT in database
      // ----------------------------------------------

      user.token = token;
      await user.save();

      // ----------------------------------------------
      // Store JWT in HTTP-only cookie
      // ----------------------------------------------

      res.cookie(
        "accessToken",
        token,
        getAccessTokenCookieOptions()
      );

// ----------------------------------------------
// Login success
// ----------------------------------------------

return res
  .status(200)
  .json({
    status: 200,

    message: "Login successful.",

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
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              error.message,
          });
      }

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Internal server error.",
        });
    }
  }
);

// ======================================================
// LOGOUT
// ======================================================

authRouter.post(
  "/logout",
  async (req, res) => {
    try {
      const token = req.cookies?.accessToken;
      if (token) {
        const user = await User.findOne({ token });
        if (user) {
          user.token = null;
          await user.save();
        }
      }

      res.clearCookie(
        "accessToken",
        getAccessTokenCookieOptions()
      );

      return res
        .status(200)
        .json({
          status: 200,

          message:
            "Logged out successfully.",
        });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Unable to logout.",
        });
    }
  }
);

// ======================================================
// FORGOT PASSWORD
// ======================================================

authRouter.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const { email } =
        req.body;

      if (!email) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Email is required.",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            status: 404,

            message:
              "No account found with this email address.",
          });
      }

      // Auto-verify the user's email if not yet verified,
      // so they can proceed with the password reset flow.

      if (!user.otpVerified) {
        user.otpVerified = true;

        await user.save();
      }

      // ----------------------------------------------
      // Start password reset flow
      // ----------------------------------------------

      user.resetPasswordVerified =
        false;

      user.resetPasswordVerifiedAt =
        null;

      user.resetPasswordTokenHash =
        null;

      user.resetPasswordTokenExpires =
        null;

      try {
        const otpResult =
          await issueOtp(
            user
          );

        return res
          .status(200)
          .json({
            status: 200,

            message:
              "Password reset OTP has been sent to your email.",

            email:
              user.email,

            resendAvailableAt:
              otpResult.resendAvailableAt,
          });
      } catch (otpError) {
        if (
          otpError.code ===
          "OTP_RATE_LIMIT"
        ) {
          return res
            .status(429)
            .json({
              status: 429,

              message:
                otpError.message,
            });
        }

        if (
          otpError.code ===
          "OTP_COOLDOWN"
        ) {
          return res
            .status(429)
            .json({
              status: 429,

              message:
                otpError.message,

              remainingSeconds:
                otpError.remainingSeconds,

              resendAvailableAt:
                user.otpResendAvailableAt,
            });
        }

        throw otpError;
      }
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Unable to send reset OTP.",
        });
    }
  }
);

// ======================================================
// VERIFY RESET PASSWORD OTP
// ======================================================

authRouter.post(
  "/verify-reset-otp",
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Email and OTP are required.",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const cleanOtp =
        String(otp).trim();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            status: 404,

            message:
              "User not found.",
          });
      }

      if (
        !user.resetOtp ||
        !user.resetOtpExpires
      ) {
        return res
          .status(400)
          .json({
            status: 400,

            message:
              "No password reset OTP is active.",
          });
      }

      // ----------------------------------------------
      // Expired
      // ----------------------------------------------

      if (
        new Date() >
        user.resetOtpExpires
      ) {
        user.resetOtp = null;

        user.resetOtpExpires =
          null;

        user.otpAttempts = 0;

        await user.save();

        return res
          .status(400)
          .json({
            status: 400,

            message:
              "OTP has expired. Please request a new OTP.",
          });
      }

      // ----------------------------------------------
      // Attempt limit
      // ----------------------------------------------

      if (
        (user.otpAttempts || 0) >=
        MAX_OTP_ATTEMPTS
      ) {
        user.resetOtp = null;

        user.resetOtpExpires =
          null;

        user.otpAttempts = 0;

        await user.save();

        return res
          .status(429)
          .json({
            status: 429,

            message:
              "Too many incorrect OTP attempts. Please request a new OTP.",
          });
      }

      // ----------------------------------------------
      // Compare hashed OTP
      // ----------------------------------------------

      const submittedOtpHash =
        hashOtp(cleanOtp);

      if (
        user.resetOtp !==
        submittedOtpHash
      ) {
        user.otpAttempts =
          (user.otpAttempts || 0) +
          1;

        const remainingAttempts =
          MAX_OTP_ATTEMPTS -
          user.otpAttempts;

        if (
          user.otpAttempts >=
          MAX_OTP_ATTEMPTS
        ) {
          user.resetOtp = null;

          user.resetOtpExpires =
            null;

          user.otpAttempts = 0;

          await user.save();

          return res
            .status(429)
            .json({
              status: 429,

              message:
                "Too many incorrect OTP attempts. Please request a new OTP.",
            });
        }

        await user.save();

        return res
          .status(400)
          .json({
            status: 400,

            message:
              "Invalid OTP.",

            remainingAttempts,
          });
      }

      // ----------------------------------------------
      // OTP correct
      // ----------------------------------------------

      const resetToken =
        generateSecureToken();

      const resetTokenHash =
        hashToken(
          resetToken
        );

      const resetTokenExpires =
        getResetTokenExpiry();

      // ----------------------------------------------
      // Consume OTP
      // ----------------------------------------------

      user.resetOtp = null;

      user.resetOtpExpires =
        null;

      user.otpAttempts = 0;

      // ----------------------------------------------
      // Store only reset-token hash
      // ----------------------------------------------

      user.resetPasswordTokenHash =
        resetTokenHash;

      user.resetPasswordTokenExpires =
        resetTokenExpires;

      user.resetPasswordVerified =
        true;

      user.resetPasswordVerifiedAt =
        new Date();

      await user.save();

      // ----------------------------------------------
      // HTTP-only cookie
      // ----------------------------------------------

      res.cookie(
        "resetToken",
        resetToken,
        getResetCookieOptions()
      );

      return res
        .status(200)
        .json({
          status: 200,

          message:
            "OTP verified successfully.",

          verified: true,

          email:
            user.email,

          resetTokenExpires:
            resetTokenExpires,
        });
    } catch (error) {
      console.error(
        "Reset OTP verification error:",
        error
      );

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Internal server error.",
        });
    }
  }
);

// ======================================================
// RESET / CHANGE PASSWORD
// ======================================================

authRouter.post(
  "/reset-password",
  async (req, res) => {
    try {
      const {
        password,
        confirmPassword,
      } = req.body;

      // ----------------------------------------------
      // Read HTTP-only cookie
      // ----------------------------------------------

      const resetToken =
        req.cookies?.resetToken;

      if (!resetToken) {
        return res
          .status(403)
          .json({
            status: 403,

            message:
              "Password reset authorization is missing or expired.",
          });
      }

      // ----------------------------------------------
      // Validate password
      // ----------------------------------------------

      const validatedData =
        await resetPasswordSchema.validate(
          {
            password,
            confirmPassword,
          },
          {
            abortEarly: true,
          }
        );

      // ----------------------------------------------
      // Hash token from cookie
      // ----------------------------------------------

      const resetTokenHash =
        hashToken(
          resetToken
        );

      // ----------------------------------------------
      // Find valid reset authorization
      // ----------------------------------------------

      const user =
        await User.findOne({
          resetPasswordTokenHash:
            resetTokenHash,

          resetPasswordTokenExpires:
            {
              $gt: new Date(),
            },

          resetPasswordVerified:
            true,
        });

      if (!user) {
        res.clearCookie(
          "resetToken",
          getResetCookieOptions()
        );

        return res
          .status(403)
          .json({
            status: 403,

            message:
              "Password reset authorization is invalid or expired.",
          });
      }

      // ----------------------------------------------
      // Hash new password
      // ----------------------------------------------

      const hashedPassword =
        await bcrypt.hash(
          validatedData.password,
          10
        );

      user.password =
        hashedPassword;

      // ----------------------------------------------
      // Consume reset authorization
      // ----------------------------------------------

      user.resetPasswordTokenHash =
        null;

      user.resetPasswordTokenExpires =
        null;

      user.resetPasswordVerified =
        false;

      user.resetPasswordVerifiedAt =
        null;

      user.resetOtp = null;

      user.resetOtpExpires =
        null;

      user.otpAttempts = 0;

      await user.save();

      // ----------------------------------------------
      // Clear reset cookie
      // ----------------------------------------------

      res.clearCookie(
        "resetToken",
        getResetCookieOptions()
      );

      return res
        .status(200)
        .json({
          status: 200,

          message:
            "Password changed successfully.",
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
        return res
          .status(400)
          .json({
            status: 400,

            message:
              error.message,
          });
      }

      return res
        .status(500)
        .json({
          status: 500,

          message:
            "Internal server error.",
        });
    }
  }
);

// ======================================================
// CHECK EMAIL EXISTS
// ======================================================

authRouter.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 400, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ status: 404, message: "Email isn't registered." });
    }

    return res.status(200).json({ status: 200, message: "Email exists." });
  } catch (error) {
    console.error("Check email error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error." });
  }
});

// ======================================================
// CHECK AUTH
// ======================================================

authRouter.get(
  "/check-auth",
  require("../middleware/authMiddleware"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password -resetPasswordTokenHash -resetOtp");

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Authenticated.",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("Check auth error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error.",
      });
    }
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = authRouter;