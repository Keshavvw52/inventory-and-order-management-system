import React from "react";

const Badge = ({ children, variant = "info", className = "" }) => {
  const variantClass = `badge-${variant}`;

  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
};

export default Badge;
