import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./VerifyEmail.scss";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token || !email) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        const response = await newRequest.get("/auth/verify-email", {
          params: { token, email },
        });

        setStatus("success");
        setMessage(response.data);

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data || "Verification failed");
      }
    };

    verifyEmail();
  }, [token, email, navigate]);

  return (
    <div className="verify-email">
      <div className="verify-container">
        <div className={`verify-content ${status}`}>
          {status === "loading" && (
            <>
              <div className="spinner"></div>
              <h2>Verifying Your Email</h2>
              <p>Please wait...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="success-icon">✓</div>
              <h2>Email Verified!</h2>
              <p>{message}</p>
              <p className="redirect-text">Redirecting to login in 3 seconds...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="error-icon">✕</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <button onClick={() => navigate("/login")}>Go to Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
