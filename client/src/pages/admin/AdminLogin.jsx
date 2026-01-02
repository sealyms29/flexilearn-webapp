import React, { useState, useEffect } from 'react'
import "./AdminLogin.scss"
import newRequest from '../../utils/newRequest';
import { useNavigate } from "react-router-dom";
 
function AdminLogin({ isAdmin = true }) {
  const[username,setUsername] = useState("");
  const[password,setPassword] = useState("");
  const[error,setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in as admin, redirect to dashboard
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user?.isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);
  
  const handleSubmit = async (e)=>{
    e.preventDefault()
    console.log("=== Admin Login Attempt ===");
    console.log("Username:", username);
    try{
      const res = await newRequest.post("/auth/login", {username, password});
      console.log("=== Login Success ===");
      console.log("Full response:", res.data);
      
      // Check if user is admin
      if (isAdmin && !res.data.isAdmin) {
        console.warn("⚠️ Access denied: User is not an admin");
        setError("Access denied: Admins only");
        return;
      }
      
      console.log("Has accessToken?", !!res.data.accessToken);
      console.log("accessToken value:", res.data.accessToken);
      
      localStorage.setItem("currentUser",  JSON.stringify(res.data));
      console.log("currentUser stored");
      
      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        console.log("✅ accessToken stored in localStorage");
      } else {
        console.warn("⚠️ No accessToken in response!");
      }
      
      console.log("Stored in localStorage:");
      console.log("accessToken:", localStorage.getItem("accessToken"));
      console.log("currentUser:", localStorage.getItem("currentUser"));
      
      // Navigate to admin dashboard
      navigate("/admin/dashboard")
    }
    catch(err){
      console.error("=== Admin Login Failed ===");
      console.error("Error:", err);
      console.error("Response:", err.response?.data);
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <h1>Admin Login</h1>
        <p>Enter your credentials to access the admin panel</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>

        <div className="login-footer">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;