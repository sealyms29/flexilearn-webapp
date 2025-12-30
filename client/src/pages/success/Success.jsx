import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Success.scss";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");
  const paymentMethod = params.get("method") || "card"; // Get payment method from query param

  useEffect(() => {
    const makeRequest = async () => {
      try {
        console.log("Confirming payment with intent:", payment_intent);
        
        // Confirm the payment and update order status
        const response = await newRequest.put("/orders", { payment_intent });
        console.log("Confirmation response:", response.data);
        setOrder(response.data.order || response.data);

        // Fetch the order details
        const ordersResponse = await newRequest.get("/orders");
        console.log("Orders response:", ordersResponse.data);
        
        if (ordersResponse.data && ordersResponse.data.length > 0) {
          const latestOrder = ordersResponse.data[ordersResponse.data.length - 1];
          setOrder(latestOrder);
        }

        setLoading(false);

        // Redirect after 10 seconds
        const timer = setTimeout(() => {
          navigate("/orders");
        }, 10000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Error confirming payment:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Payment confirmed, but there was an issue. Please check your orders.");
        setLoading(false);
      }
    };

    if (payment_intent) {
      makeRequest();
    }
  }, [payment_intent, navigate]);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-container">
          <h2>Processing your payment...</h2>
          <p>Please wait while we confirm your order.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page error">
        <div className="success-container">
          <h2>⚠️ {error}</h2>
          <button onClick={() => navigate("/orders")}>Go to Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your payment has been processed successfully. An email confirmation has been sent to you.
        </p>

        {order && (
          <div className="receipt">
            <h2>Order Receipt</h2>
            <div className="receipt-details">
              <div className="receipt-row">
                <span className="label">Order ID:</span>
                <span className="value">{order._id ? order._id.substring(0, 16).toUpperCase() : "ORD-" + Date.now()}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Service:</span>
                <span className="value">{order.title || "Logo Design Service"}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Amount Paid:</span>
                <span className="value amount">${order.price || "21.00"}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Payment Method:</span>
                <span className="value">
                  {paymentMethod && paymentMethod.toLowerCase() === "fpx" ? "🏦 FPX" : "💳 Credit Card"}
                </span>
              </div>
              <div className="receipt-row">
                <span className="label">Payment Status:</span>
                <span className="value status completed">✓ Completed</span>
              </div>
              <div className="receipt-row">
                <span className="label">Date:</span>
                <span className="value">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Time:</span>
                <span className="value">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Transaction ID:</span>
                <span className="value" style={{ fontSize: "12px", fontFamily: "monospace" }}>pi_dummy_{Date.now()}</span>
              </div>
            </div>

            <div className="receipt-message">
              <p>
                ✉️ A detailed receipt has been sent to your email address. You can also download
                or print this receipt using the buttons below.
              </p>
            </div>

            <div className="receipt-actions">
              <button className="btn-print" onClick={handlePrintReceipt}>
                🖨️ Print Receipt
              </button>
              <button className="btn-primary" onClick={() => navigate("/orders")}>
                View All Orders
              </button>
            </div>
          </div>
        ) || (
          <div className="receipt">
            <h2>Order Receipt</h2>
            <div className="receipt-details">
              <div className="receipt-row">
                <span className="label">Order ID:</span>
                <span className="value">ORD-{Date.now().toString().slice(-8).toUpperCase()}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Service:</span>
                <span className="value">Logo Design Service</span>
              </div>
              <div className="receipt-row">
                <span className="label">Amount Paid:</span>
                <span className="value amount">$21.00</span>
              </div>
              <div className="receipt-row">
                <span className="label">Payment Method:</span>
                <span className="value">
                  {paymentMethod && paymentMethod.toLowerCase() === "fpx" ? "🏦 FPX" : "💳 Credit Card"}
                </span>
              </div>
              <div className="receipt-row">
                <span className="label">Payment Status:</span>
                <span className="value status completed">✓ Completed</span>
              </div>
              <div className="receipt-row">
                <span className="label">Date:</span>
                <span className="value">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Time:</span>
                <span className="value">{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Transaction ID:</span>
                <span className="value" style={{ fontSize: "12px", fontFamily: "monospace" }}>pi_dummy_{Date.now()}</span>
              </div>
            </div>

            <div className="receipt-message">
              <p>
                ✉️ A detailed receipt has been sent to your email address. You can also download
                or print this receipt using the buttons below.
              </p>
            </div>

            <div className="receipt-actions">
              <button className="btn-print" onClick={handlePrintReceipt}>
                🖨️ Print Receipt
              </button>
              <button className="btn-primary" onClick={() => navigate("/orders")}>
                View All Orders
              </button>
            </div>
          </div>
        )}

        <p className="redirect-message">
          You will be redirected to your orders page in 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default Success;