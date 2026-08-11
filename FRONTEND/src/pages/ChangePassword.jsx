import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Remove old message when user starts typing again
    setMessage("");
    setMessageType("");
  };

  // ======================================================
  // PASSWORD REQUIREMENTS
  // ======================================================

  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;

  // ======================================================
  // PASSWORD MATCH
  // ======================================================

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const passwordsDoNotMatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    // Check password requirements
    if (
      !hasMinLength ||
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber ||
      !hasSpecial
    ) {
      setMessage(
        "Password does not meet all the required conditions."
      );
      setMessageType("error");
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    // Get email saved during reset process
    const email = sessionStorage.getItem("resetEmail");

    if (!email) {
      setMessage(
        "Reset session expired. Please start the password reset again."
      );
      setMessageType("error");

      setTimeout(() => {
        navigate("/forgot-password");
      }, 1500);

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      // Backend error
      if (!response.ok) {
        setMessage(
          data.message || "Unable to change password."
        );
        setMessageType("error");
        return;
      }

      // Success
      setMessage(
        data.message || "Password changed successfully!"
      );
      setMessageType("success");

      // Remove reset information
      sessionStorage.removeItem("resetEmail");

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Reset password error:", error);

      setMessage(
        "Something went wrong. Please try again."
      );

      setMessageType("error");
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
          <h2>Mini CRM</h2>
        </div>

        {/* HERO */}

        <div className="hero-content">
          <h1>
            Secure your
            <br />
            account easily
          </h1>

          <p>
            Create a strong new password and keep your
            Mini CRM account safe and secure.
          </p>

          {/* DASHBOARD IMAGE */}

          <div className="dashboard">
            <img
              src={dashboard}
              alt="CRM Dashboard"
            />
          </div>
        </div>

        {/* TRUSTED TEAMS */}

        <div className="trusted-teams">
          <div className="avatars">
            <img src={avatar1} alt="Team member" />
            <img src={avatar2} alt="Team member" />
            <img src={avatar3} alt="Team member" />
            <img src={avatar4} alt="Team member" />
          </div>

          <div className="team-text">
            <h3>Trusted by 2,000+ Teams</h3>

            <p>
              Helping businesses increase productivity
              every day.
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

          <h2>Change Password</h2>

          <p>
            Enter a strong new password for your account.
          </p>

          {/* FRONTEND MESSAGE */}

          {message && (
            <div
              className={`form-message ${messageType}`}
            >
              {message}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* ==================================================
                NEW PASSWORD
            ================================================== */}

            <div className="input-group">
              <label>New Password</label>

              <div className="password-box">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div className="input-group">
              <label>Confirm Password</label>

              <div className="password-box">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>

              {/* PASSWORD MATCH MESSAGE
                  INSIDE CONFIRM PASSWORD BLOCK */}

              {formData.confirmPassword && (
                <div
                  className={`password-match ${
                    passwordsMatch
                      ? "success"
                      : "error"
                  }`}
                >
                  {passwordsMatch
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </div>
              )}
            </div>

            {/* ==================================================
                PASSWORD REQUIREMENTS
            ================================================== */}

            <div className="password-info">
              <p>Password requirements:</p>

              <ul>
                {/* 8 CHARACTERS */}

                <li
                  className={
                    hasMinLength
                      ? "requirement valid"
                      : "requirement"
                  }
                >
                  <span>
                    {hasMinLength ? "✓" : "•"}
                  </span>

                  At least 8 characters
                </li>

                {/* UPPERCASE */}

                <li
                  className={
                    hasUppercase
                      ? "requirement valid"
                      : "requirement"
                  }
                >
                  <span>
                    {hasUppercase ? "✓" : "•"}
                  </span>

                  At least one uppercase letter
                </li>

                {/* LOWERCASE */}

                <li
                  className={
                    hasLowercase
                      ? "requirement valid"
                      : "requirement"
                  }
                >
                  <span>
                    {hasLowercase ? "✓" : "•"}
                  </span>

                  At least one lowercase letter
                </li>

                {/* NUMBER */}

                <li
                  className={
                    hasNumber
                      ? "requirement valid"
                      : "requirement"
                  }
                >
                  <span>
                    {hasNumber ? "✓" : "•"}
                  </span>

                  At least one number
                </li>

                {/* SPECIAL CHARACTER */}

                <li
                  className={
                    hasSpecial
                      ? "requirement valid"
                      : "requirement"
                  }
                >
                  <span>
                    {hasSpecial ? "✓" : "•"}
                  </span>

                  At least one special character
                </li>
              </ul>
            </div>

            {/* ==================================================
                UPDATE PASSWORD BUTTON
            ================================================== */}

            <button
              type="submit"
              className="reset-btn"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>

          {/* ==================================================
              LOGIN LINK
          ================================================== */}

          <p className="login-link">
            Remember your password?{" "}
            <button
              type="button"
              className="login-button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;