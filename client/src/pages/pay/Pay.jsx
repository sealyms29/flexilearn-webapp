import React, { useEffect, useState } from "react";
import "./Pay.scss";
import newRequest from "../../utils/newRequest";
import { useParams, useNavigate } from "react-router-dom";
import CheckoutwalaForm from "../../components/checkoutForm/CheckoutwalaForm";
import getCurrentUser from "../../utils/getCurrentUser";
import { getPaymentMethodDetails } from "../../utils/paymentMethods";

const AVAILABLE_METHODS = ["card", "fpx"];

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = getCurrentUser();

  // 1️⃣ Check authentication
  useEffect(() => {
    if (!currentUser) {
      alert("⚠️ You must log in first to proceed with payment!");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // 2️⃣ Create payment intent ONLY after user clicks Continue
  const makeRequest = async () => {
    if (!id || !currentUser) return;

    try {
      setLoadingIntent(true);
      setError(null);

      const res = await newRequest.post(
        `/orders/create-payment-intent/${id}`,
        { paymentMethod }
      );

      setClientSecret(res.data.clientSecret);
      setLoadingIntent(false);
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError("Failed to initialize payment. Please try again.");
      setLoadingIntent(false);
    }
  };

  // Error UI
  if (error) {
    return (
      <div className="pay">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pay">
      <div className="pay-container">

        {/* 🔹 Payment Method Selector */}
        <div className="payment-method-selector">
          <h3>Select Payment Method</h3>

          <div className="payment-methods">
            {AVAILABLE_METHODS.map((method) => {
              const details = getPaymentMethodDetails(method);

              return (
                <label
                  key={method}
                  className={`payment-method-option ${
                    paymentMethod === method ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method}
                    checked={paymentMethod === method}
                    disabled={loadingIntent}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />

                  <span className="method-label">
                    <strong>{details?.name || method.toUpperCase()}</strong>
                  </span>
                </label>
              );
            })}
          </div>

          {/* 🔹 Continue Button */}
          <button
            className="continue-payment-btn"
            disabled={loadingIntent}
            onClick={makeRequest}
          >
            Continue with {paymentMethod.toUpperCase()}
          </button>
        </div>

        {/* 🔹 Payment Form Area */}
        <div className="payment-form-wrapper">
          {loadingIntent ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Creating your order...</p>
            </div>
          ) : clientSecret ? (
            <CheckoutwalaForm
              key={clientSecret}
              paymentMethod={paymentMethod}
              clientSecret={clientSecret}
              gigId={id}
            />
          ) : (
            <p>Please select a payment method and continue.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Pay;
