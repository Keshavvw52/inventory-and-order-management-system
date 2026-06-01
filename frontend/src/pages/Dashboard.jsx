import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight } from "lucide-react";

import { getDashboardStats } from "../services/dashboardService";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const cardsData = [
    {
      title: "Total Products",
      value: stats?.total_products ?? 0,
      icon: Package,
      color: "var(--primary)",
      bgColor: "var(--primary-light)",
      link: "/products"
    },
    {
      title: "Active Customers",
      value: stats?.total_customers ?? 0,
      icon: Users,
      color: "var(--success)",
      bgColor: "var(--success-light)",
      link: "/customers"
    },
    {
      title: "Orders Placed",
      value: stats?.total_orders ?? 0,
      icon: ShoppingCart,
      color: "#eab308",
      bgColor: "#fef9c3",
      link: "/orders"
    }
  ];

  const lowStockHeaders = [
    { label: "Product Name", style: { width: "40%" } },
    { label: "SKU / Code", style: { width: "30%" } },
    { label: "Stock Left", style: { width: "30%" } },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Quick stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="card-hover">
              {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="skeleton skeleton-text" style={{ width: "50%", height: "16px" }} />
                  <div className="skeleton skeleton-text" style={{ width: "30%", height: "32px" }} />
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      {card.title}
                    </span>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}>
                      {card.value}
                    </span>
                    <Link 
                      to={card.link} 
                      style={{ 
                        fontSize: "0.75rem", 
                        color: card.color, 
                        textDecoration: "none", 
                        fontWeight: 700, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        marginTop: "8px" 
                      }}
                    >
                      Manage Directory <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div 
                    style={{ 
                      width: "56px", 
                      height: "56px", 
                      borderRadius: "16px", 
                      backgroundColor: card.bgColor, 
                      color: card.color, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center" 
                    }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Warnings & Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Low Stock Watchlist */}
        <Card title="Low Stock Watchlist">
          {error ? (
            <div style={{ color: "var(--danger)", padding: "12px 0" }}>Failed to load dashboard metrics.</div>
          ) : (
            <Table
              headers={lowStockHeaders}
              isLoading={isLoading}
              isEmpty={stats?.low_stock_products?.length === 0}
              emptyMessage="All products are well stocked! No low-stock items detected."
              skeletonRows={3}
            >
              {stats?.low_stock_products?.map((prod) => (
                <tr key={prod.id} className="table-row">
                  <td className="td" style={{ fontWeight: 600 }}>{prod.name}</td>
                  <td className="td">
                    <code style={{ fontSize: "0.8125rem", padding: "2px 6px", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                      {prod.sku}
                    </code>
                  </td>
                  <td className="td">
                    <span 
                      className="badge badge-danger" 
                      style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}
                    >
                      <AlertTriangle size={12} />
                      {prod.stock_quantity} remaining
                    </span>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        {/* Informative instructions / usage panel */}
        <Card title="System Instructions">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.6" }}>
            <p>
              Welcome to the administrative portal. To perform standard workflows, proceed with these steps:
            </p>
            <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <strong>Register Products:</strong> Add products to catalog under the <Link to="/products" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Products</Link> section. Ensure each has a unique SKU and non-negative stock.
              </li>
              <li>
                <strong>Add Customers:</strong> Record clients and email details under the <Link to="/customers" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Customers</Link> directory.
              </li>
              <li>
                <strong>Create Orders:</strong> Create customer orders under the <Link to="/orders" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Orders</Link> dashboard. Creating an order checks catalog stock and auto-deducts inventory levels.
              </li>
            </ol>
            <p style={{ fontSize: "0.8125rem", fontStyle: "italic", color: "var(--text-muted)", borderTop: "1px solid var(--surface-border)", paddingTop: "12px" }}>
              Note: System locks stock levels during order creation. If an order is canceled, the stock is automatically restored to the inventory pool.
            </p>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default Dashboard;
