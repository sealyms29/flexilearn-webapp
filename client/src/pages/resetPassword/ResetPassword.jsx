import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { validatePassword } from "../../utils/securityUtils";
import "./ResetPassword.scss";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link");
    }
  }, [token, email]);

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, newPassword: password });

    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordStrength?.valid) {
      setError(passwordStrength?.message || "Password is not strong enough");
      return;
    }

    setLoading(true);
    try {
      await newRequest.post("/auth/reset-password", {
        token,
        email,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password">
        <div className="reset-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been changed successfully.</p>
            <p className="redirect-text">Redirecting to login in 3 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password">
      <div className="reset-container">
        <h1>Reset Your Password</h1>
        <p>Enter your new password below</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passwordStrength && (
              <div
                className={`password-strength ${
                  passwordStrength.valid ? "valid" : "invalid"
                }`}
              >
                <small>
                  {passwordStrength.valid ? "✓ " : "✕ "}
                  {passwordStrength.message}
                </small>
              </div>
            )}

            <p className="password-hint">
              Password must be 6-8 characters with 1 uppercase, 1 number, and 1
              special character
            </p>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>

            {formData.confirmPassword &&
              formData.newPassword === formData.confirmPassword && (
                <p className="match-message">✓ Passwords match</p>
              )}
            {formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <p className="mismatch-message">✕ Passwords do not match</p>
              )}
          </div>

          <button
            type="submit"
            className="reset-btn"
            disabled={loading || !passwordStrength?.valid}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="back-to-login">
          Remember your password?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
