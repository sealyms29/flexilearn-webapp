import React, { useState } from "react";
import "./BecomeSeller.scss";
import { useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: currentUser?.username || "",
    email: currentUser?.email || "",
    phoneNumber: "",
    experience: "",
    category: "",
    portfolio: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const mutation = useMutation({
    mutationFn: (data) =>
      newRequest.post("/users/become-seller", data),
    onSuccess: () => {
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        experience: "",
        category: "",
        portfolio: "",
        description: "",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || "An error occurred");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.experience ||
      !formData.category
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await mutation.mutateAsync(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="becomeSeller">
        <div className="container">
          <div className="loginPrompt">
            <h2>Please log in to become a seller</h2>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="becomeSeller">
      <div className="container">
        <div className="wrapper">
          <div className="title">
            <h1>Become a FlexiLearn Seller</h1>
            <p>Start earning by offering your services</p>
          </div>

          {success && (
            <div className="successMessage">
              ✓ Your application has been submitted successfully! Redirecting...
            </div>
          )}

          {error && <div className="errorMessage">✗ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Years of Experience *</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="advanced">Advanced (3-5 years)</option>
                <option value="expert">Expert (5+ years)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Service Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="graphic-design">Graphic & Design</option>
                <option value="digital-marketing">Digital Marketing</option>
                <option value="writing">Writing & Translation</option>
                <option value="video-animation">Video & Animation</option>
                <option value="music-audio">Music & Audio</option>
                <option value="programming">Programming & Tech</option>
                <option value="data">Data</option>
                <option value="business">Business</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="photography">Photography</option>
              </select>
            </div>

            <div className="form-group">
              <label>Portfolio Link</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="Link to your portfolio or website"
              />
            </div>

            <div className="form-group">
              <label>About You</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your skills and expertise..."
                rows="5"
              />
            </div>

            <button
              type="submit"
              className="submitBtn"
              disabled={loading || mutation.isPending}
            >
              {loading || mutation.isPending
                ? "Submitting..."
                : "Apply to Become a Seller"}
            </button>
          </form>

          <div className="benefits">
            <h3>Why sell on FlexiLearn?</h3>
            <ul>
              <li>Earn money doing what you love</li>
              <li>Work on your own schedule</li>
              <li>Reach millions of potential customers</li>
              <li>Secure payments and buyer protection</li>
              <li>24/7 seller support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
