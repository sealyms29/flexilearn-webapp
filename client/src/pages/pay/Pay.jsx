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

  // Check if user is authenticated
  useEffect(() => {
    if (!currentUser) {
      alert("⚠️ You must log in first to proceed with payment!\n\nPlease log in or register, then try accessing a gig again.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Create payment intent when payment method changes
  useEffect(() => {
    if (!id || !currentUser) return;

    // Generate dummy client secret immediately on frontend
    // This allows form to display instantly without waiting for backend
    const dummyClientSecret = `seti_dummy_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    
    console.log("Generated dummy client secret:", dummyClientSecret);
    setClientSecret(dummyClientSecret);
    setLoadingIntent(false);
  }, [id, currentUser, paymentMethod]);

  if (error && !clientSecret) {
    return (
      <div className="pay">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pay">
      <div className="pay-container">
        {/* Payment Method Selector */}
        <div className="payment-method-selector">
          <h3>Select Payment Method</h3>
          <div className="payment-methods">
            {AVAILABLE_METHODS.map((method) => {
              const details = getPaymentMethodDetails(method);
              return (
                <label key={method} className="payment-method-option">
                  <input
                    type="radio"
                    name="payment-method"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="method-label">
                    <strong>{details?.name || method}</strong>
                    {details?.description && <p>{details.description}</p>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form-wrapper">
          {loadingIntent ? (
            <div className="loading-spinner">
              <p>Setting up payment form...</p>
            </div>
          ) : clientSecret ? (
            <CheckoutwalaForm key={paymentMethod} paymentMethod={paymentMethod} clientSecret={clientSecret} gigId={id} />
          ) : (
            <div className="loading-spinner">
              <p>Loading payment...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pay;