import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const urlEmail = params.get("email");

  const [email, setEmail] = useState(urlEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (urlEmail) setEmail(urlEmail);
  }, [urlEmail]);

  const sendOtp = async (normalizedEmail) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      }
    );

    let data = {};
    try { data = await response.json(); } catch { data = {}; }

    return { response, data };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const { response, data } = await sendOtp(normalizedEmail);

      // If it failed and it's NOT a cooldown error, show the error
      if (!response.ok && !data.remainingSeconds) {
        setError(data.message || "Unable to send OTP.");
        return;
      }

      // If it succeeded OR they hit the cooldown limit,
      // it means an OTP was already sent recently.
      // So we just automatically navigate them to the OTP page!
      const sentTo = data.email || normalizedEmail;
      
      sessionStorage.setItem("resetEmail", sentTo);
      sessionStorage.setItem("otpFlow", "reset");
      sessionStorage.removeItem("resetPasswordVerified");

      navigate(
        `/reset-password?mode=reset&email=${encodeURIComponent(sentTo)}`,
        { replace: true }
      );
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = () => {
    if (loading) return "Sending OTP...";
    return "Reset Password";
  };

  return (
    <AuthLayout
      title={<>Reset your<br />password easily</>}
      subtitle="Enter your registered email address and we will help you recover your account."
    >
      <div className="auth-form-header">
        <h2>Forgot Password?</h2>
        <p>Enter your email address to receive a password reset OTP.</p>
      </div>

      {error && (
        <div className="auth-error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-input-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            autoComplete="email"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={loading}
        >
          {buttonLabel()}
        </button>
      </form>

      <p className="auth-login-link">
        Remember your password? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;