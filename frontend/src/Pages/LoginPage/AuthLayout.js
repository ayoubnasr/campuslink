import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../static/LoginPage/Login.css";

/**
 * Shared layout of the log in, sign up and forgot password pages: the campus photo with the
 * CampusLink logo on the left, and the page's form box (`children`) in the white panel on the right.
 * Switching between these pages only swaps the box.
 */
const AuthLayout = ({ children }) => {

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

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

        {/* RIGHT - FORM BOX */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", marginRight: "10%", padding: "60px"}}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
