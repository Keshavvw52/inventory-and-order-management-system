import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard Overview";
    if (path.startsWith("/products")) return "Product Inventory";
    if (path.startsWith("/customers")) return "Customer Directory";
    if (path.startsWith("/orders")) {
      if (path.split("/").length > 2) return "Order Details";
      return "Order Management";
    }
    return "Inventory & Orders System";
  };

  return (
    <header className="navbar">
      {/* Title */}
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
        {getPageTitle()}
      </h2>

      {/* Actions / Profile info */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Mock Notification Icon */}
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "50%",
            transition: "background-color 0.15s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#f1f5f9"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
        >
          <Bell size={20} />
          <span 
            style={{ 
              position: "absolute", 
              top: "6px", 
              right: "6px", 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: "var(--danger)" 
            }}
          />
        </button>

        <div style={{ width: "1px", height: "24px", backgroundColor: "var(--surface-border)" }} />

        {/* Mock User Details */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div 
            style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem"
            }}
          >
            KS
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Keshav Sharma
            </span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--text-muted)", marginTop: "-2px" }}>
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
