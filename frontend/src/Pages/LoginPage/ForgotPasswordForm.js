import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPassResetEmail } from "./auth_requests.js";
import AuthLayout from "./AuthLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../static/LoginPage/Login.css";

/**
 * "Forgot password" page: the user enters their AUB email and receives a reset link.
 * The link opens a page served by the backend where the new password is chosen.
 */
const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.endsWith("@mail.aub.edu")) {
      setError("Email must end with @mail.aub.edu");
      return;
    }

    setSending(true);
    const result = await requestPassResetEmail(email);
    setSending(false);

    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message || "Could not send the reset email. Please try again later.");
    }
  };

  return (
    <AuthLayout>
      <div className="card login-card p-4 shadow-lg border-0">
        <h2 className="text-center fw-bold mb-3" id="IN">Reset password</h2>
        <p className="text-muted text-center">
          Enter your AUB email and we'll send you a link to choose a new password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="reset_email_input">Email</label>
            <input
              type="email"
              id="reset_email_input"
              className="form-control"
              placeholder="abc12@mail.aub.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn login-btn w-100" disabled={sending}>
            {sending ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-center mt-3">
          <Link to="/login" className="text-muted">Back to log in</Link>
        </p>

        {message && <p className="text-success text-center">{message}</p>}
        {error && <p className="text-danger text-center">{error}</p>}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
