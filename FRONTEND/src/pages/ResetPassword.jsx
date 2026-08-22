import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || sessionStorage.getItem("otpFlow") || "reset";
  const urlEmail = params.get("email");
  const savedEmail = sessionStorage.getItem("resetEmail");
  const email = urlEmail || savedEmail || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (email) {
      sessionStorage.setItem("resetEmail", email);
    }
    if (mode) {
      sessionStorage.setItem("otpFlow", mode);
    }
  }, [email, mode]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

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
    setMessage("");
  };

  const handleEditEmail = () => {
    if (!email) {
      navigate("/forgot-password");
      return;
    }
    navigate(`/forgot-password?email=${encodeURIComponent(email)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (!email) {
      setError("Email is missing. Please start the process again.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = mode === "signup" ? "/auth/verify-otp" : "/auth/verify-reset-otp";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      if (mode === "signup") {
        sessionStorage.removeItem("otpFlow");
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetPasswordVerified");

        setMessage("Email verified successfully. Redirecting to login...");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);
        return;
      }

      setMessage("OTP verified successfully. Redirecting...");

      setTimeout(() => {
        navigate(`/change-password?email=${encodeURIComponent(email)}`, {
          replace: true,
        });
      }, 800);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) {
      return;
    }

    setError("");
    setMessage("");
    setOtp(""); // Clear OTP immediately when resend starts

    if (!email) {
      setError("Email is missing. Please start again.");
      return;
    }

    try {
      setResending(true);

      const endpoint = mode === "signup" ? "/auth/resend-otp" : "/auth/forgot-password";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.message || "Unable to resend OTP.");

        if (data.remainingSeconds) {
          setResendCooldown(Number(data.remainingSeconds));
        }
        return;
      }

      setMessage(data.message || "A new OTP has been sent.");
      setResendCooldown(60);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Unable to connect to server.");
    } finally {
      setResending(false);
    }
  };

  const title = "Verify OTP";
  const description =
    mode === "signup"
      ? "Enter the 6-digit code sent to your email to verify your account."
      : "Enter the 6-digit code sent to your email to reset your password.";

  return (
    <AuthLayout
      title={
        <>
          Verify your<br />account securely
        </>
      }
      subtitle="Enter the verification code sent to your registered email address."
    >
      <div className="auth-form-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {email && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px' }}>
          <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>{email}</span>
          <button
            type="button"
            onClick={handleEditEmail}
            style={{ background: 'none', border: 'none', color: '#5b4bff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Edit
          </button>
        </div>
      )}

      {message && (
        <div className="auth-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="auth-error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-input-group">
          <label>Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="auth-otp-resend">
          Didn't receive the code?{" "}
          {resendCooldown > 0 ? (
            <span style={{ color: '#9ca3af' }}>Resend in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <p className="auth-login-link">
          Remember your password? <Link to="/login" replace>Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;