import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = "",
  bodyClassName = "",
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>}
            {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
