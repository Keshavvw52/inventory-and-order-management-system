import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const Navbar = ({ isSidebarCollapsed, onToggleSidebar, onOpenMobileSidebar }) => {
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
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button className="icon-button mobile-only" onClick={onOpenMobileSidebar}>
          <Menu size={18} />
        </button>
        <button className="icon-button desktop-only" onClick={onToggleSidebar}>
          {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {getPageTitle()}
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {location.pathname === "/" ? "Dashboard / Overview" : "Operations workspace"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="desktop-only">
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
              Keshav Kumar
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
