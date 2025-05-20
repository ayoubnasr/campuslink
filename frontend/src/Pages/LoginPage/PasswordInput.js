import React, { useState } from "react";

const PasswordInput = ({ id, value, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-container">
      <input
        type={visible ? "text" : "password"}
        className="form-control"
        id={id}
        placeholder="Enter your password"
        onChange={onChange}
        value={value}
        required
      />
      <span
        className="toggle-password"
        onClick={() => setVisible(!visible)}
        role="button"
        tabIndex={0}
        style={{
          opacity: visible? 1 : 0.5
        }}
      >
        {"👁"}
      </span>
    </div>
  );
};

export default PasswordInput;
