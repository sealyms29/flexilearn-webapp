import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { validateEmail } from "../../utils/securityUtils";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value) {
      if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await newRequest.post("/auth/forgot-password", {
        email,
      });

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.response?.data || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password">
        <div className="forgot-container">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
            <p>
              If an account exists with that email address, you will receive a
              password reset link shortly.
            </p>
            <p className="email-text">Recovery link sent to: <strong>{email}</strong></p>
            <p className="hint">
              The link will expire in 1 hour. If you don't see the email, check
              your spam folder.
            </p>
            <button
              className="back-to-login-btn"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <div className="forgot-container">
        <h1>Forgot Password?</h1>
        <p>Enter your email address and we'll send you a link to reset your password.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            {emailError && <p className="field-error">{emailError}</p>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !!emailError}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="footer">
          <p>
            Remember your password?{" "}
            <button type="button" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
