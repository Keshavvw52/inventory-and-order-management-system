import React, { forwardRef } from "react";

const Input = forwardRef(({
  label,
  name,
  type = "text",
  error,
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label" htmlFor={name}>{label}</label>}
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        className={`form-input ${error ? "form-input-error" : ""}`}
        style={error ? { borderColor: "var(--danger)", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" } : {}}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
