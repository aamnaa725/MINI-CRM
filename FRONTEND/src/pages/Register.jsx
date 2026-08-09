import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Remove error for the field being edited
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      general: "",
    }));

    setSuccessMessage("");
  };

  // =========================
  // VALIDATE FORM
  // =========================

  const validateForm = () => {
    const newErrors = {};

    // FULL NAME
    const fullName = formData.fullName.trim();

    if (!fullName) {
      newErrors.fullName = "Full Name is required";
    } else if (fullName.length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    } else if (fullName.length > 50) {
      newErrors.fullName = "Name cannot exceed 50 characters";
    } else if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(fullName)) {
      newErrors.fullName =
        "Name can contain letters, spaces, apostrophes and hyphens only";
    }

    // EMAIL
    const email = formData.email.trim();

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // PHONE
    const phone = formData.phone.trim();

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = phone.replace(/[\s-]/g, "");

      if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
        newErrors.phone =
          "Enter a valid phone number (10-15 digits)";
      }
    }

    // PASSWORD
    const password = formData.password;

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password =
        "Password must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    // CONFIRM PASSWORD
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // CREATE USER
  // =========================

  const CreateUserData = async (userData) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        setErrors({
          general: data.message || "Registration failed",
        });

        return;
      }

      // SUCCESS
     // SUCCESS
setErrors({});
setSuccessMessage("Account created successfully! Redirecting to login...");

// Redirect to login page and send only the email
setTimeout(() => {
  navigate("/login", {
    state: {
      email: userData.email,
    },
  });
}, 1000);
    } catch (error) {
      console.error("Fetch failed:", error);

      setErrors({
        general:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    await CreateUserData(formData);
  };

  return (
    <div className="container-main">

      {/* LEFT PANEL */}

      <div className="left-panel">

        <div className="logo">
          <h2>Mini CRM</h2>
        </div>

        <div className="hero-content">
          <h1>
            Manage your sales <br />
            pipeline like a pro
          </h1>

          <p>
            Track leads, close deals, and grow your business with a
            modern CRM designed for growing teams.
          </p>
        </div>

        <div className="dashboard">
          <img src={dashboard} alt="Dashboard" />
        </div>

        <div className="trusted-teams">

          <div className="avatars">
            <img src={avatar1} alt="user" />
            <img src={avatar2} alt="user" />
            <img src={avatar3} alt="user" />
            <img src={avatar4} alt="user" />
          </div>

          <div className="team-text">
            <h3>
              Trusted by 2,000+ Teams
            </h3>

            <p>
              Helping businesses increase productivity every day.
            </p>
          </div>

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="right-panel">

        <div className="form-container">

          <h2>Create your Account</h2>

          <p>
            Join thousands of businesses managing their sales efficiently.
          </p>

          {/* GENERAL ERROR */}

          {errors.general && (
            <div className="general-error">
              {errors.general}
            </div>
          )}

          {/* SUCCESS */}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}

            <div className="input-group">

              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? "input-error" : ""}
                maxLength={50}
                required
              />

              {errors.fullName && (
                <span className="error-message">
                  {errors.fullName}
                </span>
              )}

            </div>

            {/* EMAIL */}

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                required
              />

              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}

            </div>

            {/* PHONE */}

            <div className="input-group">

              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="+92 300 1234567"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
                required
              />

              {errors.phone && (
                <span className="error-message">
                  {errors.phone}
                </span>
              )}

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label>Password</label>

              <div
                className={`password-box ${
                  errors.password ? "password-error" : ""
                }`}
              >

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="input-group">

              <label>Confirm Password</label>

              <div
                className={`password-box ${
                  errors.confirmPassword
                    ? "password-error"
                    : ""
                }`}
              >

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm password"
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
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword}
                </span>
              )}

            </div>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="register-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating Account..."
                : "Create Account"}
            </button>

            <p className="login-link">

              Already have an account?{" "}

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

export default Register;