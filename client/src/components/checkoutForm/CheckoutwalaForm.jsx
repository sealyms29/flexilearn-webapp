import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const CheckoutwalaForm = ({ paymentMethod, clientSecret, gigId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardName: "",
  });

  const navigate = useNavigate();

  // Fill with dummy test data
  const fillDummyData = () => {
    setCardDetails({
      cardNumber: "4242 4242 4242 4242",
      cardExpiry: "12/25",
      cardCVC: "123",
      cardName: "TEST USER",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "cardNumber") {
      // Format card number: 1234 5678 9012 3456
      const cleanValue = value.replace(/\s/g, "").replace(/[^0-9]/g, "");
      const formatted = cleanValue.replace(/(\d{4})/g, "$1 ").trim();
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else if (name === "cardExpiry") {
      // Format expiry: MM/YY
      const cleanValue = value.replace(/[^0-9]/g, "");
      if (cleanValue.length >= 2) {
        const formatted = cleanValue.slice(0, 2) + "/" + cleanValue.slice(2, 4);
        setCardDetails({ ...cardDetails, [name]: formatted });
      } else {
        setCardDetails({ ...cardDetails, [name]: cleanValue });
      }
    } else if (name === "cardCVC") {
      // Only numbers, max 3
      const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 3);
      setCardDetails({ ...cardDetails, [name]: cleanValue });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const validateForm = () => {
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.cardExpiry || !cardDetails.cardCVC || !cardDetails.cardName) {
        setMessage("❌ Please fill in all payment details");
        return false;
      }

      const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, "");
      if (cleanCardNumber.length !== 16) {
        setMessage("❌ Card number must be 16 digits");
        return false;
      }

      if (cardDetails.cardCVC.length !== 3) {
        setMessage("❌ CVC must be 3 digits");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      console.log("Processing dummy payment...");
      console.log("Payment method:", paymentMethod);
      console.log("Client secret:", clientSecret);
      
      const response = await newRequest.put("/orders", {
        payment_intent: clientSecret,
      });

      console.log("Order confirmed:", response.data);
      setMessage("✅ Payment successful! Redirecting to success page...");

      // Redirect to success page with payment intent ID and payment method
      setTimeout(() => {
        navigate(`/success?payment_intent=${encodeURIComponent(clientSecret)}&method=${encodeURIComponent(paymentMethod)}`);
      }, 1500);
    } catch (error) {
      console.error("Payment error:", error);
      setMessage(
        error.response?.data?.message || "❌ Payment failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form" style={{ 
      width: "100%",
      maxWidth: "500px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        {paymentMethod === "card" ? "💳 Card Payment" : "🏦 FPX Payment"}
      </h3>

      {paymentMethod === "card" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ 
            backgroundColor: "#fff9e6", 
            border: "1px solid #ffd700", 
            padding: "12px", 
            borderRadius: "4px", 
            textAlign: "center",
            marginBottom: "10px"
          }}>
            <button
              type="button"
              onClick={fillDummyData}
              style={{
                backgroundColor: "#ffd700",
                color: "#333",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                width: "100%"
              }}
            >
              🎯 Auto-Fill Dummy Card Details
            </button>
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
              Click to quickly fill test card: 4242 4242 4242 4242
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>Cardholder Name</label>
            <input
              type="text"
              name="cardName"
              placeholder="John Doe"
              value={cardDetails.cardName}
              onChange={handleInputChange}
              required
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>Card Number</label>
            <input
              type="text"
              name="cardNumber"
              placeholder="4242 4242 4242 4242"
              maxLength="19"
              value={cardDetails.cardNumber}
              onChange={handleInputChange}
              required
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "monospace"
              }}
            />
            <small style={{ color: "#999", fontSize: "12px" }}>
              Test Card: 4242 4242 4242 4242
            </small>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>Expiry (MM/YY)</label>
              <input
                type="text"
                name="cardExpiry"
                placeholder="12/25"
                maxLength="5"
                value={cardDetails.cardExpiry}
                onChange={handleInputChange}
                required
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "monospace"
                }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>CVC</label>
              <input
                type="text"
                name="cardCVC"
                placeholder="123"
                maxLength="3"
                value={cardDetails.cardCVC}
                onChange={handleInputChange}
                required
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "monospace"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "fpx" && (
        <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
          <p style={{ fontSize: "16px", marginBottom: "10px", color: "#333" }}>
            🏦 FPX (Online Banking Transfer)
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            This is a test transaction. Click below to proceed with dummy FPX payment.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: isLoading ? "#ccc" : "#5469d4",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: isLoading ? "not-allowed" : "pointer",
          width: "100%",
          transition: "all 0.3s ease",
        }}
      >
        {isLoading ? "Processing..." : `Pay with ${paymentMethod === "card" ? "Card" : "FPX"}`}
      </button>

      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
            color: message.includes("✅") ? "#155724" : "#721c24",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      <div style={{
        marginTop: "20px",
        padding: "12px",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#856404",
        textAlign: "center",
      }}>
        <strong>⚠️ Dummy Payment System</strong>
        <p style={{ margin: "5px 0 0 0" }}>No real charges will be made. This is for testing only.</p>
      </div>
    </form>
  );
};

export default CheckoutwalaForm;
