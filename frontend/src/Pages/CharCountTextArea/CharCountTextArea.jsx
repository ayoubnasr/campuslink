import React, { useState, useRef } from "react";

export default function CharCountTextArea({
  value,
  onChange,
  placeholder = "",
  maxLength = 512,
  style = {},
}) {
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);

  // Handle dynamic resizing of the textarea based on content
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to auto
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height to the scroll height
    }
  };

  return (
    <div style={{ position: "relative", width: "100%"}}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{...style, overflow: "hidden"}}
      />
      {isFocused && (
        <div
          style={{
            position: "absolute",
            bottom: "0px",
            right: "10px",
            fontSize: "0.7em",
            color: (value)?(value.length < maxLength ? "gray" : "red"):"gray",
            pointerEvents: "none",
          }}
        >
          {(value)?value.length:0}/{maxLength}
        </div>
      )}
    </div>
  );
}
