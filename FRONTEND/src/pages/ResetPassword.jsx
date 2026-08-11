import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/ResetPassword.css";


function ResetPassword() {

  const navigate = useNavigate();

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");


  // ======================================================
  // OTP INPUT
  // ======================================================

  const handleOtpChange = (e) => {

    const value = e.target.value;

    // Only numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Maximum 6 digits
    if (value.length > 6) {
      return;
    }

    setOtp(value);

    setError("");
  };


  // ======================================================
  // VERIFY OTP
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");


    // Check OTP
    if (otp.length !== 6) {

      setError("Please enter the 6-digit OTP");

      return;
    }


    // Get email saved from Forgot Password page
    const email = sessionStorage.getItem("resetEmail");


    if (!email) {

      setError(
        "Reset session expired. Please request a new OTP."
      );

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );


      const data = await response.json();


      // Backend error
      if (!response.ok) {

        setError(
          data.message || "Invalid OTP"
        );

        return;
      }


      // OTP verified
      setMessage(
        data.message || "OTP verified successfully"
      );


      // Store verification status
      sessionStorage.setItem(
        "otpVerified",
        "true"
      );


      // Redirect to change password
      setTimeout(() => {

        navigate("/change-password");

      }, 800);


    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );

      setError(
        "Unable to connect to server. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // ======================================================
  // RESEND OTP
  // ======================================================

  const handleResend = async () => {

    setError("");
    setMessage("");


    const email = sessionStorage.getItem("resetEmail");


    if (!email) {

      setError(
        "Please go back and enter your email again."
      );

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.message || "Unable to resend OTP"
        );

        return;
      }


      // Development testing only
      console.log("New OTP:", data.otp);


      setMessage(
        "A new OTP has been generated."
      );


      setOtp("");


    } catch (error) {

      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        "Unable to connect to server."
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


        <div className="logo">

          <h2>
            Mini CRM
          </h2>

        </div>


        <div className="hero-content">

          <h1>
            Verify your
            <br />
            account securely
          </h1>


          <p>
            Enter the verification code sent
            to your registered email address.
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


          <h2>
            Verify OTP
          </h2>


          <p>
            Enter the 6-digit verification code
            sent to your email.
          </p>


          {/* SUCCESS MESSAGE */}

          {message && (

            <div className="success-message">

              {message}

            </div>

          )}


          {/* ERROR MESSAGE */}

          {error && (

            <div className="error-message">

              {error}

            </div>

          )}


          <form onSubmit={handleSubmit}>


            {/* OTP */}

            <div className="input-group">

              <label>
                Verification Code
              </label>


              <input
                type="text"
                name="otp"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                autoComplete="one-time-code"
                required
              />

            </div>


            {/* VERIFY */}

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >

              {loading
                ? "Verifying..."
                : "Verify OTP"
              }

            </button>


            {/* RESEND */}

            <p className="otp-resend">

              Didn't receive the code?

              {" "}

              <button
                type="button"
                className="resend-btn"
                onClick={handleResend}
                disabled={loading}
              >

                Resend OTP

              </button>

            </p>


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


export default ResetPassword;