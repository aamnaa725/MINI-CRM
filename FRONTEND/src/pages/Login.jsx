import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe =
      localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedRememberMe) {
      setFormData((previous) => ({
        ...previous,
        email: savedEmail,
      }));

      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    if (name === "email" && rememberMe) {
      const email = value.trim().toLowerCase();

      if (email) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    }
  };

  const handleRememberMe = (e) => {
    const checked = e.target.checked;

    setRememberMe(checked);

    if (checked) {
      localStorage.setItem("rememberMe", "true");

      const email = formData.email.trim().toLowerCase();

      if (email) {
        localStorage.setItem("rememberedEmail", email);
      }
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      navigate("/forgot-password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 404) {
        setError("Email isn't registered");
        return;
      }

      if (!response.ok) {
        setError("Unable to verify email.");
        return;
      }

      navigate(`/forgot-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (
        response.status === 403 &&
        data.requiresVerification === true
      ) {
        const unverifiedEmail =
          data.email ||
          data.user?.email ||
          email;

        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("user");

        sessionStorage.setItem(
          "resetEmail",
          unverifiedEmail
        );

        sessionStorage.setItem("otpFlow", "signup");

        sessionStorage.removeItem(
          "resetPasswordVerified"
        );

        navigate(
          `/reset-password?mode=signup&email=${encodeURIComponent(
            unverifiedEmail
          )}`,
          {
            replace: true,
          }
        );

        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      if (!data.user) {
        setError(
          "Login succeeded, but user information was not returned."
        );

        return;
      }

      if (rememberMe) {
        localStorage.setItem(
          "rememberMe",
          "true"
        );

        localStorage.setItem(
          "rememberedEmail",
          email
        );
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedEmail");
      }

      sessionStorage.setItem(
        "isLoggedIn",
        "true"
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOtp");
      sessionStorage.removeItem("otpFlow");
      sessionStorage.removeItem(
        "resetPasswordVerified"
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to server. Please try again."
      );
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
      subtitle="Simple, powerful and productive CRM designed to help your business grow."
    >
      <div className="auth-form-header">
        <h2>Welcome Back</h2>
        <p>Login to your Mini CRM account.</p>
      </div>

      {error && (
        <div className="auth-error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
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

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <div className="auth-login-options">
          <label htmlFor="rememberMe" className="auth-remember-me">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMe}
            />
            <span>Remember Me</span>
          </label>
          <div className="auth-forgot-password">
            <button type="button" onClick={handleForgotPassword} className="forgot-password-btn">Forgot Password?</button>
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="auth-login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;