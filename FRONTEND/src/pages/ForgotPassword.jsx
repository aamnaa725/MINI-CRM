import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // HANDLE EMAIL CHANGE
  // ======================================================

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    setError("");
    setMessage("");
  };

  // ======================================================
  // HANDLE FORGOT PASSWORD
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ----------------------------------------------------
    // Validate email
    // ----------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address");
      return;
    }

    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        normalizedEmail
      )
    ) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // ----------------------------------------------------
      // Clear any previous OTP session
      // ----------------------------------------------------

      sessionStorage.removeItem("otpVerified");
      sessionStorage.removeItem("otpPurpose");

      // ----------------------------------------------------
      // Request OTP
      // ----------------------------------------------------

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      // ----------------------------------------------------
      // Read response safely
      // ----------------------------------------------------

      const data = await response.json();

      console.log("Forgot password response:", data);

      // ----------------------------------------------------
      // Backend error
      // ----------------------------------------------------

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to send OTP. Please try again."
        );

        return;
      }

      // ----------------------------------------------------
      // Save reset information
      // ----------------------------------------------------

      sessionStorage.setItem(
        "resetEmail",
        normalizedEmail
      );

      // IMPORTANT:
      // Tell ResetPassword.jsx this OTP is for
      // PASSWORD RESET, not account verification.

      sessionStorage.setItem(
        "otpPurpose",
        "password-reset"
      );

      sessionStorage.setItem(
        "otpVerified",
        "false"
      );

      // ----------------------------------------------------
      // Success
      // ----------------------------------------------------

      setMessage(
        data.message ||
          "OTP has been sent to your email."
      );

      // ----------------------------------------------------
      // Redirect to OTP verification
      // ----------------------------------------------------

      setTimeout(() => {
        navigate("/reset-password");
      }, 800);

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main">

      {/* ==================================================
          LEFT PANEL
      ================================================== */}

      <div className="left-panel">

        {/* LOGO */}

        <div className="logo">

          <h2>
            Mini CRM
          </h2>

        </div>


        {/* HERO */}

        <div className="hero-content">

          <h1>
            Reset your
            <br />
            password easily
          </h1>

          <p>
            Enter your registered email address
            and we will help you recover your account.
          </p>

        </div>


        {/* DASHBOARD */}

        <div className="dashboard">

          <img
            src={dashboard}
            alt="CRM Dashboard"
          />

        </div>


        {/* TRUSTED TEAMS */}

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


      {/* ==================================================
          RIGHT PANEL
      ================================================== */}

      <div className="right-panel">

        <div className="form-container">

          {/* HEADING */}

          <h2>
            Forgot Password?
          </h2>


          <p>
            Enter your email address to receive
            a password reset OTP.
          </p>


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}


          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          {/* ==================================================
              FORM
          ================================================== */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="input-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                autoComplete="email"
                required
              />

            </div>


            {/* RESET BUTTON */}

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >

              {loading
                ? "Sending OTP..."
                : "Reset Password"}

            </button>


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

export default ForgotPassword;