import React from "react";

function Button({ children, type = "button", disabled = false, className = "auth-btn", onClick }) {
  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
