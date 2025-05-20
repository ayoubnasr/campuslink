import React, { useState } from "react";
import PasswordInput from "./PasswordInput";
import { requestSignup } from "./auth_requests.js";
import { Link, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "../../static/LoginPage/signup.css";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const validateEmail = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailWarning(value.endsWith("@mail.aub.edu") ? "" : "⚠ Email must end with @mail.aub.edu");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(""); 
    setError(""); 

    try {
        const responseMessage = await requestSignup(email, password);
        
        if (responseMessage.success){
          setMessage(responseMessage.message); 
        }
        else {
          setError(responseMessage.message || "An unexpected error occurred."); 
        }
    } catch (err) {
        setError("⚠ Failed to fetch. This might be a server error, but please check your connection.");
    }
  };

  function checkPasswordStrength(password_input) {
    const passwd_Vald = zxcvbn(password_input);
    setPasswordWarning(passwd_Vald.score < 3 ? "⚠ Weak password: " + passwd_Vald.feedback.suggestions.slice(-1) : "");
  }

  return (
    <div className="signup-wrapper d-flex align-items-center justify-content-center vh-100">
      <div className="signup-box p-4 shadow-lg border-0 bg-white">
        <h2 className="text-center fw-bold mb-4" id="IN">Sign Up</h2>

        <form className="form-content" onSubmit={handleSubmit}>
          {/* 📧 Email Input */}
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="studentaccount@mail.aub.edu"
              value={email}
              onChange={validateEmail}
              required
            />
            {emailWarning && <small className="text-danger">{emailWarning}</small>}
          </div>

          {/* 🔒 Password Input */}
          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <PasswordInput id="newPassword" value={password} onChange={(e) => {
              checkPasswordStrength(e.target.value);
              setPassword(e.target.value);
            }} />
            {passwordWarning && <small className="text-danger">{passwordWarning}</small>}
          </div>

          {/* Sign Up Button */}
          <button type="submit" className="btn signup-btn w-100" disabled={emailWarning !== ""}>Sign Up</button>
          
          {/* Login Link */}
          <p className="text-center mt-3">
            Already have an account? <Link to="/login" className="btn create-btn">Login</Link>
          </p>

          {/* Error / Success Messages */}
          {error && <p className="text-danger text-center">{error}</p>}
          {message && !error && <p className="text-success text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
