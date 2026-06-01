import React, { useEffect } from "react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${size === "lg" ? "modal-content-lg" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ padding: "18px 24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              transition: "background-color 0.15s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f1f5f9"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            &times;
          </button>
        </div>
        
        <div style={{ padding: "24px", overflowY: "auto", flexGrow: 1 }}>
          {children}
        </div>

        {footer && (
          <div 
            style={{ 
              padding: "16px 24px", 
              borderTop: "1px solid var(--surface-border)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "#f8fafc",
              borderBottomLeftRadius: "var(--radius-lg)",
              borderBottomRightRadius: "var(--radius-lg)"
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
