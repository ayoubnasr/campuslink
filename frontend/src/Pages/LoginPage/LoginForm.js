import React, { useState, useEffect } from "react";
import PasswordInput from "./PasswordInput";
import { requestLogin, requestClubLogin } from "./auth_requests.js";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../static/LoginPage/Login.css";

const LoginForm = () => {
  const [userEmail, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [clubCRN, setClubCRN] = useState("");
  const [clubPassword, setClubPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Expose state setters to the window object so external scripts can access them
    window.React = window.React || {};
    window.React.setEmail = setEmail;
    window.React.setUserPassword = setUserPassword;
    window.React.setClubCRN = setClubCRN;
    window.React.setClubPassword = setClubPassword;

    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
      // Clean up after component is unmounted
      delete window.React.setEmail;
      delete window.React.setUserPassword;
      delete window.React.setClubCRN;
      delete window.React.setClubPassword;
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleRoleSelection = (event) => {
    setRole(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setMessage('Logging into user account...');

      if (role === 'cabinet'){
        setMessage(`Logging into club account as ${userEmail}...`);
        const clubLoginResult = await requestClubLogin(userEmail, userPassword, clubCRN, clubPassword);

        if (clubLoginResult.success){
          setMessage(clubLoginResult.message);
          navigate("/home");
        }
        else {
          setError(clubLoginResult.message);
          setMessage("");
        }
      }
      else {
          
        const userLoginResult = await requestLogin(userEmail, userPassword);

        if (userLoginResult.success){
          setMessage(userLoginResult.message);
          navigate("/home");

        }
        else {
          setError(userLoginResult.message);
          setMessage("");
        }
      }

    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    }

  };

  return (
    <div className="login-container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",   
          height: "100%",        
          margin: 0              
        }}
      >
        {/* LEFT - INFO SECTION */}
        
        <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }} >
          {/* 🌟 CampusLink Logo - Centered */}
          

          <div style={{justifyContent: "center", textAlign: "center"}}>
            <img
              src={require("../../images/logo.png")}
              alt="CampusLink Logo"
              className="campus-logo"
            />
            <h1>American University of Beirut</h1>
            <p style={{color:"white", fontSize: "20px", fontWeight: "bolder", marginTop: "-00px"}}>
              Discover vibrant campus events, connect with student communities, and seamlessly manage your event experience—all in one place!
            </p>
          </div>
        </div>

        {/* RIGHT - LOGIN FORM */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", marginRight: "10%", padding: "60px"}}>
          <div className="card login-card p-4 shadow-lg border-0">
            <h2 className="text-center fw-bold mb-4" id = "IN">Log in</h2>

            {/* 🎯 Role Selection */}
            <div className="mb-3">
              <label className="form-label fw-bold">As:</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="loginType"
                    value="student"
                    checked={role === "student"}
                    onChange={handleRoleSelection}
                  />
                  <label className="form-check-label">Student</label>
                </div>
                <div className="form-check">
                  <input
                    id="cabinet-radio"
                    className="form-check-input"
                    type="radio"
                    name="loginType"
                    value="cabinet"
                    checked={role === "cabinet"}
                    onChange={handleRoleSelection}
                  />
                  <label className="form-check-label">Cabinet</label>
                </div>
              </div>
            </div>

            {/* 📧 Email Input */}
            <div className="mb-3">
              <label className="form-label">Email or Username </label>
              <input
                type="email"
                className="form-control"
                id="email_input"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 🔒 Password Input */}
            <div className="mb-3">
              <label className="form-label">Password </label>
              <PasswordInput
                id="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                required
              />
            </div>

            {/* 📌 Cabinet-Specific Fields */}
            {role === "cabinet" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Club CRN</label>
                  <input
                    type="text"
                    className="form-control"
                    id="club_crn_input"
                    placeholder="Enter club CRN"
                    onChange={(e) => setClubCRN(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Club Password</label>
                  <PasswordInput 
                  id="clubPassword" 
                  value={clubPassword}
                  onChange={(e) => setClubPassword(e.target.value)}
                  required
                  />
                </div>
              </>
            )}

            {/* Login Button */}
            <button
              type="submit"
              id="login-btn"
              className="btn login-btn w-100"
              onClick={handleSubmit}
            >
              Log In
            </button>

            {/* Forgot Password */}
            <p className="text-center mt-3">
              <Link to="/forgot-password" className="text-muted">
                Forgot password?
              </Link>
            </p>

            {/* Sign Up Link */}
            <p className="mt-3 text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="btn create-btn">
                Sign Up
              </Link>
            </p>

            {/* Error / Success Messages */}
            {message && <p className="text-success text-center">{message}</p>}
            {error && <p className="text-danger text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
