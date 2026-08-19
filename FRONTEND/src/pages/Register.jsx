import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheck, FaCircle } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  };

  const password = formData.password;

  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!allRequirementsMet) {
      setError("Please make sure your password meets all the requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      const registeredEmail = data.email || formData.email;

      sessionStorage.setItem("resetEmail", registeredEmail);
      sessionStorage.setItem("otpFlow", "signup");
      sessionStorage.removeItem("otpVerified");
      sessionStorage.removeItem("resetPasswordVerified");
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("user");

      navigate(
        `/reset-password?mode=signup&email=${encodeURIComponent(
          registeredEmail
        )}`,
        { replace: true }
      );
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Manage your<br />business smarter
        </>
      }
      subtitle="Organize customers, track activity and grow your business with Mini CRM."
    >
      <div className="auth-form-header">
        <h2>Create Account</h2>
        <p>Create your Mini CRM account to get started.</p>
      </div>

      {error && (
        <div className="auth-error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-input-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            required
          />
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <div className="auth-password-info">
          <p>Password requirements:</p>
          <ul className="auth-requirements">
            <li className={passwordRequirements.minLength ? "valid" : ""}>
              <span>{passwordRequirements.minLength ? <FaCheck /> : <FaCircle />}</span>
              <span>At least 8 characters</span>
            </li>
            <li className={passwordRequirements.uppercase ? "valid" : ""}>
              <span>{passwordRequirements.uppercase ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one uppercase letter</span>
            </li>
            <li className={passwordRequirements.lowercase ? "valid" : ""}>
              <span>{passwordRequirements.lowercase ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one lowercase letter</span>
            </li>
            <li className={passwordRequirements.number ? "valid" : ""}>
              <span>{passwordRequirements.number ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one number</span>
            </li>
            <li className={passwordRequirements.special ? "valid" : ""}>
              <span>{passwordRequirements.special ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one special character</span>
            </li>
          </ul>
        </div>

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        {formData.confirmPassword && (
          <div
            className={
              formData.password === formData.confirmPassword
                ? "auth-password-match success"
                : "auth-password-match error"
            }
          >
            {formData.password === formData.confirmPassword
              ? "✓ Passwords match"
              : "✕ Passwords do not match"}
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="auth-login-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;