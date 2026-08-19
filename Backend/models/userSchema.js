const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==================================================
    // BASIC USER INFORMATION
    // ==================================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ==================================================
    // SIGNUP / EMAIL OTP VERIFICATION
    // ==================================================

    otpVerified: {
      type: Boolean,
      default: false,
    },

    // Current OTP.
    // This is used for both signup verification
    // and password-reset OTP.
    resetOtp: {
      type: String,
      default: null,
    },

    // OTP expiry time
    resetOtpExpires: {
      type: Date,
      default: null,
    },

    // ==================================================
    // OTP SECURITY / RATE LIMITING
    // ==================================================

    // Number of resend requests
    otpResendCount: {
      type: Number,
      default: 0,
    },

    // Number of INCORRECT otp submissions for the
    // currently active OTP. Used to lock out brute-force
    // guessing (see MAX_OTP_ATTEMPTS in authRouter.js).
    //
    // IMPORTANT: this field must exist here, otherwise
    // Mongoose's default strict mode silently drops writes
    // to it and the attempt counter never persists.
    otpAttempts: {
      type: Number,
      default: 0,
    },

    // Start of the resend-count window
    otpResendWindowStartedAt: {
      type: Date,
      default: null,
    },

    // When this date is reached, the resend block expires
    otpResendBlockedUntil: {
      type: Date,
      default: null,
    },

    // ==================================================
    // SERVER-SIDE 60 SECOND RESEND COOLDOWN
    // ==================================================

    // IMPORTANT:
    // This is controlled by the SERVER.
    //
    // Do NOT depend on sessionStorage/localStorage
    // for security.
    //
    // The backend checks this value before allowing
    // another OTP to be sent.
    otpResendAvailableAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // PASSWORD RESET VERIFICATION
    // ==================================================

    // True only after the password-reset OTP
    // has been successfully verified.
    resetPasswordVerified: {
      type: Boolean,
      default: false,
    },

    // Time when reset OTP was successfully verified
    resetPasswordVerifiedAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // SECURE PASSWORD RESET TOKEN
    // ==================================================

    // IMPORTANT:
    // Only the SHA-256 HASH of the reset token
    // is stored in MongoDB.
    //
    // The actual token is placed in an HTTP-only cookie.
    resetPasswordTokenHash: {
      type: String,
      default: null,
    },

    // Expiry time of the reset authorization token
    resetPasswordTokenExpires: {
      type: Date,
      default: null,
    },

    // ==================================================
    // AUTHENTICATION TOKEN
    // ==================================================

    // Stores the active JWT token for the user
    token: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);