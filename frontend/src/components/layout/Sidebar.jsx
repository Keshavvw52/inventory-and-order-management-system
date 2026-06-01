import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/products", label: "Products", icon: Package },
    { path: "/customers", label: "Customers", icon: Users },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      {/* Brand Logo Header */}
      <div 
        style={{ 
          height: "70px", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 24px", 
          borderBottom: "1px solid #161c36" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div 
            style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "10px", 
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "white",
              fontSize: "1.2rem",
              boxShadow: "var(--shadow-glow)"
            }}
          >
            I
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.02em" }}>
            InvOrder Sys
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                backgroundColor: active ? "var(--sidebar-active)" : "transparent",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all var(--transition-fast)"
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.target.style.backgroundColor = "var(--sidebar-hover)";
                  e.target.style.color = "var(--sidebar-text-active)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--sidebar-text)";
                }
              }}
            >
              <Icon size={18} style={{ opacity: active ? 1 : 0.8 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding info */}
      <div style={{ padding: "24px", borderTop: "1px solid #161c36", color: "#475569", fontSize: "0.75rem", fontWeight: 500 }}>
        © 2026 Assessment v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
