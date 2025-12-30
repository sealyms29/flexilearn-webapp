import React, { useState } from 'react'
import "./Login.scss"
import newRequest from '../../utils/newRequest';
import {useNavigate} from "react-router-dom";
 
function Login(){

  const[username,setUsername] = useState("");
  const[password,setPassword] = useState("");
  const[error,setError] = useState(null);

  const navigate = useNavigate();
  
  const handleSubmit = async (e)=>{
     e.preventDefault()
     console.log("=== Login Attempt ===");
     console.log("Username:", username);
     try{
        const res = await newRequest.post("/auth/login", {username, password});
        console.log("=== Login Success ===");
        console.log("Full response:", res.data);
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
        
        navigate("/")
     }
     catch(err){
        console.error("=== Login Failed ===");
        console.error("Error:", err);
        console.error("Response:", err.response?.data);
        setError(err.response?.data || "Login failed");
     }
  };

  return (
    <div className='login'>
      <form onSubmit={handleSubmit}>
        <h1> Sign in </h1>
        <label htmlFor=''>Username</label>
        <input name='username' type='text' placeholder='arvindk25' onChange={(e)=>setUsername(e.target.value)}/>
        <label htmlFor=''>Password</label>
        <input name='password' type='password' onChange={e=>setPassword(e.target.value)} />
        <button type='submit'>Login</button>
        {error && error}
      </form>
    </div>
  );
}

export default Login
