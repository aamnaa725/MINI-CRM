import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // Seconds before another OTP can be requested
  const [resendTimer, setResendTimer] = useState(0);

  // 15-minute cooldown
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // ======================================================
  // GET EMAIL
  // ======================================================

  const email = sessionStorage.getItem("resetEmail");

  // ======================================================
  // COUNTDOWN TIMER
  // ======================================================

  useEffect(() => {
    const savedResendTimer =
      sessionStorage.getItem("otpResendTimer");

    const savedCooldownTimer =
      sessionStorage.getItem("otpCooldownTimer");

    if (savedResendTimer) {
      const remaining = Math.max(
        0,
        parseInt(savedResendTimer, 10)
      );

      setResendTimer(remaining);
    }

    if (savedCooldownTimer) {
      const remaining = Math.max(
        0,
        parseInt(savedCooldownTimer, 10)
      );

      setCooldownTimer(remaining);
    }

    const interval = setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          sessionStorage.removeItem(
            "otpResendTimer"
          );

          return 0;
        }

        const newValue = previous - 1;

        sessionStorage.setItem(
          "otpResendTimer",
          newValue.toString()
        );

        return newValue;
      });

      setCooldownTimer((previous) => {
        if (previous <= 1) {
          sessionStorage.removeItem(
            "otpCooldownTimer"
          );

          return 0;
        }

        const newValue = previous - 1;

        sessionStorage.setItem(
          "otpCooldownTimer",
          newValue.toString()
        );

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // FORMAT TIMER
  // ======================================================

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ======================================================
  // OTP INPUT
  // ======================================================

  const handleOtpChange = (e) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) {
      return;
    }

    if (value.length > 6) {
      return;
    }

    setOtp(value);
    setError("");
  };

  // ======================================================
  // VERIFY OTP
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    if (!email) {
      setError(
        "Reset session expired. Please request a new OTP."
      );

      navigate("/forgot-password");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid OTP"
        );

        return;
      }

      setMessage(
        data.message ||
          "OTP verified successfully"
      );

      sessionStorage.setItem(
        "otpVerified",
        "true"
      );

      // OTP verification gives a fresh reset flow
      sessionStorage.removeItem(
        "otpResendTimer"
      );

      sessionStorage.removeItem(
        "otpCooldownTimer"
      );

      setTimeout(() => {
        navigate("/change-password");
      }, 800);

    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RESEND OTP
  // ======================================================

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Please go back and enter your email again."
      );

      return;
    }

    // ==================================================
    // FRONTEND 60 SECOND CHECK
    // ==================================================

    if (resendTimer > 0) {
      setError(
        `Please wait ${resendTimer} seconds before requesting another OTP.`
      );

      return;
    }

    // ==================================================
    // FRONTEND 15 MINUTE CHECK
    // ==================================================

    if (cooldownTimer > 0) {
      setError(
        `Too many OTP requests. Please wait ${formatTimer(
          cooldownTimer
        )}.`
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      // ==================================================
      // BACKEND RATE LIMIT
      // ==================================================

      if (response.status === 429) {
        if (data.cooldownRemaining) {
          if (
            data.cooldownRemaining > 60
          ) {
            setCooldownTimer(
              data.cooldownRemaining
            );

            sessionStorage.setItem(
              "otpCooldownTimer",
              data.cooldownRemaining.toString()
            );
          } else {
            setResendTimer(
              data.cooldownRemaining
            );

            sessionStorage.setItem(
              "otpResendTimer",
              data.cooldownRemaining.toString()
            );
          }
        }

        setError(
          data.message ||
            "Please wait before requesting another OTP."
        );

        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to resend OTP"
        );

        return;
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      setMessage(
        data.message ||
          "A new OTP has been sent to your email."
      );

      setOtp("");

      // Start 60 second timer
      setResendTimer(60);

      sessionStorage.setItem(
        "otpResendTimer",
        "60"
      );

    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="container-main">

      {/* ================= LEFT PANEL ================= */}

      <div className="left-panel">

        <div className="logo">
          <h2>Mini CRM</h2>
        </div>

        <div className="hero-content">

          <h1>
            Verify your
            <br />
            account securely
          </h1>

          <p>
            Enter the verification code sent
            to your registered email address.
          </p>

        </div>

        <div className="dashboard">

          <img
            src={dashboard}
            alt="CRM Dashboard"
          />

        </div>

        <div className="trusted-teams">

          <div className="avatars">

            <img
              src={avatar1}
              alt="user"
            />

            <img
              src={avatar2}
              alt="user"
            />

            <img
              src={avatar3}
              alt="user"
            />

            <img
              src={avatar4}
              alt="user"
            />

          </div>

          <div className="team-text">

            <h3>
              Trusted by 2,000+ Teams
            </h3>

            <p>
              Helping businesses increase
              productivity every day.
            </p>

          </div>

        </div>

      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="right-panel">

        <div className="form-container">

          <h2>
            Verify OTP
          </h2>

          <p>
            Enter the 6-digit verification code
            sent to your email.
          </p>

          {/* SUCCESS */}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* OTP */}

            <div className="input-group">

              <label>
                Verification Code
              </label>

              <input
                type="text"
                name="otp"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                autoComplete="one-time-code"
                required
              />

            </div>

            {/* VERIFY */}

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            {/* RESEND */}

            <p className="otp-resend">

              Didn't receive the code?

              {" "}

              {cooldownTimer > 0 ? (

                <span className="resend-disabled">
                  Try again in{" "}
                  {formatTimer(cooldownTimer)}
                </span>

              ) : resendTimer > 0 ? (

                <span className="resend-disabled">
                  Resend OTP in{" "}
                  {resendTimer}s
                </span>

              ) : (

                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Resend OTP
                </button>

              )}

            </p>

            {/* LOGIN */}

            <p className="login-link">

              Remember your password?

              {" "}

              <Link to="/login">
                Login
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;