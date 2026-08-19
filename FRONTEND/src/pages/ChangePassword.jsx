import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaCircle } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email")?.trim().toLowerCase() || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const passwordIsValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");
    setMessageType("");

    if (!email) {
      setMessage("Reset session is invalid. Please start again.");
      setMessageType("error");
      return;
    }

    if (!passwordIsValid) {
      setMessage("Password does not meet all the required conditions.");
      setMessageType("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const requestBody = {
        email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const contentType = response.headers.get("content-type") || "";
      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        setMessage(data.message || data.error || "Unable to change password.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "Password changed successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Change password error:", error);
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Secure your<br />account easily
        </>
      }
      subtitle="Create a strong new password and keep your Mini CRM account safe and secure."
    >
      <div className="auth-form-header">
        <h2>Change Password</h2>
        <p>Enter a strong new password for your account.</p>
      </div>

      {message && (
        <div
          className={
            messageType === "success"
              ? "auth-success-message"
              : "auth-error-message"
          }
          role="alert"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <PasswordInput
          id="password"
          name="password"
          label="New Password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        {formData.confirmPassword && (
          <div
            className={
              passwordsMatch
                ? "auth-password-match success"
                : "auth-password-match error"
            }
          >
            {passwordsMatch
              ? "✓ Passwords match"
              : "✕ Passwords do not match"}
          </div>
        )}

        <div className="auth-password-info">
          <p>Password requirements:</p>
          <ul className="auth-requirements">
            <li className={hasMinLength ? "valid" : ""}>
              <span>{hasMinLength ? <FaCheck /> : <FaCircle />}</span>
              <span>At least 8 characters</span>
            </li>
            <li className={hasUppercase ? "valid" : ""}>
              <span>{hasUppercase ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one uppercase letter</span>
            </li>
            <li className={hasLowercase ? "valid" : ""}>
              <span>{hasLowercase ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one lowercase letter</span>
            </li>
            <li className={hasNumber ? "valid" : ""}>
              <span>{hasNumber ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one number</span>
            </li>
            <li className={hasSpecial ? "valid" : ""}>
              <span>{hasSpecial ? <FaCheck /> : <FaCircle />}</span>
              <span>At least one special character</span>
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={loading || !passwordIsValid || !passwordsMatch}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>

      <p className="auth-login-link">
        Remember your password?{" "}
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
        >
          Login
        </button>
      </p>
    </AuthLayout>
  );
}

export default ChangePassword;