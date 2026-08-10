import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  // Get email sent from Register page
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
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

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      general: "",
    }));

    setSuccessMessage("");
  };

  // =========================
  // VALIDATE LOGIN
  // =========================

  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // LOGIN USER
  // =========================

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
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      // Backend error
      if (!response.ok) {
        setErrors({
          general:
            data.message || "Invalid email or password",
        });

        return;
      }

      // =========================
      // LOGIN SUCCESS
      // =========================

      setSuccessMessage("Login successful!");

      console.log("Logged in user:", data.user);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (error) {
      console.error("Login failed:", error);

      setErrors({
        general:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-main">

      {/* ================= LEFT PANEL ================= */}

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
            Track leads, close deals, and grow your business
            with a modern CRM designed for growing teams.
          </p>

        </div>

        <div className="dashboard">

          <img
            src={dashboard}
            alt="Dashboard"
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
              Helping businesses increase productivity
              every day.
            </p>

          </div>

        </div>

      </div>


      {/* ================= RIGHT PANEL ================= */}

      <div className="right-panel">

        <div className="form-container">

          <h2>
            Welcome Back
          </h2>

          <p>
            Login to your account and continue managing
            your sales efficiently.
          </p>


          {/* ================= GENERAL ERROR ================= */}

          {errors.general && (
            <div className="general-error">
              {errors.general}
            </div>
          )}


          {/* ================= SUCCESS ================= */}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            {/* ================= EMAIL ================= */}

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
                required
              />

              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}

            </div>


            {/* ================= PASSWORD ================= */}

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
                  required
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

              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}

            </div>


            {/* ================= OPTIONS ================= */}

            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                />

                <span>
                  Remember Me
                </span>

              </label>

              <Link to="/forgot-password">
                Forgot Password?
              </Link>

            </div>


            {/* ================= LOGIN BUTTON ================= */}

            <button
              type="submit"
              className="register-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Logging in..."
                : "Login"}
            </button>


            {/* ================= REGISTER LINK ================= */}

            <p className="login-link">

              Don't have an account?{" "}

              <Link to="/register">
                Register
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;