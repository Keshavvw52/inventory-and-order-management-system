import React from "react";

const LoadingSpinner = ({
  size = "md",
  className = "",
  fullPage = false,
}) => {
  const sizeMap = {
    sm: "16px",
    md: "32px",
    lg: "48px",
  };

  const spinnerElement = (
    <div 
      className={`spinner spinner-primary ${className}`} 
      style={{ width: sizeMap[size], height: sizeMap[size] }}
    />
  );

  if (fullPage) {
    return (
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100%", 
          width: "100%",
          flexGrow: 1
        }}
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;
