import React, { useState } from 'react';
import "./Register.scss";
import upload from '../../utils/upload';
import newRequest from '../../utils/newRequest';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [file,setFile] = useState(null);
  const [user,setUser] = useState({
    username:"",
    email:"",
    password:"",
    country:"",
    isSeller:false,
    desc:"",
    phone:"",
    businessType:"individual",
    registrationNumber:"",
  });
  
  const navigate = useNavigate();
  
  // Password validation regex: 6-8 characters, 1 uppercase, 1 number, 1 special character
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,8}$/;
    return passwordRegex.test(password);
  };
  
  const handleChange = (e)=>{
    setUser((prev)=>{
        return { ...prev, [e.target.name]:e.target.value};
    });
  };
  
  const handleSeller = (e)=>{
    setUser((prev)=>{
        return { ...prev, isSeller:e.target.checked};
    });
  };
  
  const isUnimasStudentEmail = (email) => {
    const regex = /^[0-9]+@siswa\.unimas\.my$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!user.username || !user.email || !user.password || !user.country) {
        alert("Please fill in all fields");
        return;
      }
      
      // UNIMAS student email check
      if (!isUnimasStudentEmail(user.email)) {
        alert("Please use your UNIMAS student email (e.g. 123456@siswa.unimas.my)");
        return;
      }

      // Prevent username from being an email
      if (user.username.includes("@")) {
        alert("Username must be your name, not an email");
        return;
      }

      // Validate password
      if (!validatePassword(user.password)) {
        alert("Password must be 6-8 characters with ONE uppercase letter, ONE number, and ONE special character (!@#$%^&*)");
        return;
      }
      
      try{
          const response = await newRequest.post("/auth/register",{
            ...user,
            img: "",
          });
          console.log("Registration successful:", response);
          alert("Registration successful! Redirecting to login...");
          navigate("/login")
      }
      catch(err){
        console.error("Registration error:", err);
        alert("Registration failed: " + (err.response?.data || err.message));
      }
  };
  
  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Create a new account</h1>
          <label htmlFor="">Username</label>
          <input
            name="username"
            type="text"
            onChange={handleChange}
          />
          <label htmlFor="">Email</label>
          <input
            name="email"
            type="email"
            placeholder="123456@siswa.unimas.my"
            onChange={handleChange}
          />
          <label htmlFor="">Password</label>
          <input name="password" type="password" onChange={handleChange} />
          <label htmlFor="">Country</label>
          <input
            name="country"
            type="text"
            placeholder="Malaysia"
            onChange={handleChange}
          />
          <button type="submit">Register</button>
        </div>
        <div className="right">
          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label htmlFor="">Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          
          {user.isSeller && (
            <>
              <label htmlFor="">Business Type</label>
              <select name="businessType" onChange={handleChange} value={user.businessType}>
                <option value="individual">Individual</option>
                <option value="sole_proprietor">Sole Proprietor</option>
                <option value="llp">Limited Liability Partnership (LLP)</option>
                <option value="company">Company</option>
              </select>
              
              {user.businessType !== "individual" && (
                <>
                  <label htmlFor="">Registration / Business Number</label>
                  <input
                    name="registrationNumber"
                    type="text"
                    placeholder="Enter your registration number"
                    onChange={handleChange}
                    value={user.registrationNumber}
                  />
                </>
              )}
            </>
          )}
          
          <label htmlFor="">Phone Number</label>
          <input
            name="phone"
            type="text"
            placeholder="+60-9695271037"
            onChange={handleChange}
          />
          <label htmlFor="">Description</label>
          <textarea
            placeholder="A short description of yourself"
            name="desc"
            id=""
            cols="30"
            rows="10"
            onChange={handleChange}
          ></textarea>
        </div>
      </form>
    </div>
  );
}

export default Register
