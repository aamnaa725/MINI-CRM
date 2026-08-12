import { useState } from "react";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  // ======================================================
  // FORM DATA
  // ======================================================

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ======================================================
  // STATES
  // ======================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ======================================================
  // PASSWORD REQUIREMENTS
  // ======================================================

  const passwordRequirements = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const passwordValid =
    passwordRequirements.length &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  // ======================================================
  // PASSWORD MATCH
  // ======================================================

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear field error while typing
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      general: "",
    }));

    setSuccessMessage("");
  };

  // ======================================================
  // VALIDATE FORM
  // ======================================================

  const validateForm = () => {
    const newErrors = {};

    // Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email
    const email = formData.email.trim();

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        email
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordValid) {
      newErrors.password =
        "Password does not meet all requirements";
    }

    // Confirm password
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

  // ======================================================
  // REGISTER
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSuccessMessage("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      // Backend error
      if (!response.ok) {
        setErrors({
          general:
            data.message ||
            "Unable to create account",
        });

        return;
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      setSuccessMessage(
        "Account created successfully!"
      );

      // Redirect to login with email
    sessionStorage.setItem(
  "resetEmail",
  formData.email.trim().toLowerCase()
);

sessionStorage.setItem(
  "otpPurpose",
  "signup"
);

setTimeout(() => {
  navigate("/reset-password");
}, 800);

    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      setErrors({
        general:
          "Unable to connect to the server. Please try again.",
      });

    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // REQUIREMENT COMPONENT
  // ======================================================

  const Requirement = ({ fulfilled, children }) => {
    return (
      <li
        className={
          fulfilled
            ? "password-requirement fulfilled"
            : "password-requirement unfulfilled"
        }
      >
        {fulfilled ? (
          <FaCheckCircle className="requirement-icon" />
        ) : (
          <FaTimesCircle className="requirement-icon" />
        )}

        <span>{children}</span>
      </li>
    );
  };

  // ======================================================
  // JSX
  // ======================================================

  return (
    <div className="container-main">

      {/* ==================================================
          LEFT PANEL
      ================================================== */}

      <div className="left-panel">

        <div className="logo">
          <h2>Mini CRM</h2>
        </div>

        <div className="hero-content">

          <h1>
            Build your account
            <br />
            and grow your business
          </h1>

          <p>
            Create your Mini CRM account and start
            managing your leads, deals, and customers
            efficiently.
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

          <h2>
            Create Account
          </h2>

          <p>
            Create your account to get started
            with Mini CRM.
          </p>


          {/* ==================================================
              GENERAL ERROR
          ================================================== */}

          {errors.general && (
            <div className="general-error">
              {errors.general}
            </div>
          )}


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            {/* ==================================================
                FULL NAME
            ================================================== */}

            <div className="input-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className={
                  errors.fullName
                    ? "input-error"
                    : ""
                }
              />

              {errors.fullName && (
                <span className="error-message">
                  {errors.fullName}
                </span>
              )}

            </div>


            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="input-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={
                  errors.email
                    ? "input-error"
                    : ""
                }
              />

              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}

            </div>


            {/* ==================================================
                PHONE
            ================================================== */}

            <div className="input-group">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className={
                  errors.phone
                    ? "input-error"
                    : ""
                }
              />

              {errors.phone && (
                <span className="error-message">
                  {errors.phone}
                </span>
              )}

            </div>


            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="input-group">

              <label>
                Password
              </label>

              <div
                className={`password-box ${
                  errors.password
                    ? "password-error"
                    : ""
                }`}
              >

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>


              {/* ==================================================
                  PASSWORD REQUIREMENTS
              ================================================== */}

              <div className="password-requirements">

                <h4>
                  Password requirements:
                </h4>

                <ul>

                  <Requirement
                    fulfilled={
                      passwordRequirements.length
                    }
                  >
                    At least 8 characters
                  </Requirement>

                  <Requirement
                    fulfilled={
                      passwordRequirements.uppercase
                    }
                  >
                    At least one uppercase letter
                  </Requirement>

                  <Requirement
                    fulfilled={
                      passwordRequirements.lowercase
                    }
                  >
                    At least one lowercase letter
                  </Requirement>

                  <Requirement
                    fulfilled={
                      passwordRequirements.number
                    }
                  >
                    At least one number
                  </Requirement>

                  <Requirement
                    fulfilled={
                      passwordRequirements.special
                    }
                  >
                    At least one special character
                  </Requirement>

                </ul>

              </div>

              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}

            </div>


            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div className="input-group">

              <label>
                Confirm Password
              </label>

              <div
                className={`password-box ${
                  errors.confirmPassword
                    ? "password-error"
                    : passwordsMatch
                    ? "password-success"
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
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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


              {/* Password match message */}

              {formData.confirmPassword.length > 0 && (
                <span
                  className={
                    passwordsMatch
                      ? "password-match-success"
                      : "password-match-error"
                  }
                >
                  {passwordsMatch
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </span>
              )}

              {errors.confirmPassword &&
                !formData.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}

            </div>


            {/* ==================================================
                CREATE ACCOUNT
            ================================================== */}

            <button
              type="submit"
              className="register-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating Account..."
                : "Create Account"}
            </button>


            {/* ==================================================
                LOGIN
            ================================================== */}

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