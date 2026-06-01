import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart, X } from "lucide-react";

const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
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
    <>
      {isMobileOpen ? <button className="sidebar-backdrop" onClick={onCloseMobile} /> : null}
      <aside className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""} ${isMobileOpen ? "sidebar-mobile-open" : ""}`}>
      {/* Brand Logo Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-inner">
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
          <span className="sidebar-brand-label" style={{ color: "white", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.02em" }}>
            InvOrder Sys
          </span>
        </div>
        <button className="sidebar-close-button" onClick={onCloseMobile}>
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              title={isCollapsed ? item.label : undefined}
              onClick={onCloseMobile}
            >
              <span className="sidebar-link-indicator" />
              <Icon size={18} className="sidebar-link-icon" />
              <span className="sidebar-link-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" />
    </aside>
    </>
  );
};

export default Sidebar;
