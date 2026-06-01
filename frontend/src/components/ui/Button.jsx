import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "secondary":
        return "btn-secondary";
      case "danger":
        return "btn-danger";
      case "outline":
        return "btn-outline";
      case "primary":
      default:
        return "btn-primary";
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`btn ${getVariantClass()} ${className}`}
      {...props}
    >
      {isLoading && <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />}
      {children}
    </button>
  );
};

export default Button;
