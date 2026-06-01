import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Mail, Phone, ShoppingBag, Receipt, AlertCircle } from "lucide-react";

import { getOrderById } from "../services/orderService";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const OrderDetails = () => {
  const { id } = useParams();

  // Fetch Order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["orderDetails", id],
    queryFn: () => getOrderById(id),
  });

  const tableHeaders = [
    { label: "Product Name", style: { width: "40%" } },
    { label: "SKU / Code", style: { width: "20%" } },
    { label: "Unit Price", style: { width: "15%" } },
    { label: "Quantity", style: { width: "10%" } },
    { label: "Subtotal", style: { width: "15%", textAlign: "right" } },
  ];

  if (isLoading) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--danger)", padding: "20px" }}>
        <AlertCircle size={24} />
        <div>
          <h4 style={{ fontWeight: 700 }}>Error loading order details</h4>
          <p style={{ fontSize: "0.875rem", marginTop: "2px" }}>{error.message}</p>
          <Link to="/orders" className="btn btn-secondary" style={{ marginTop: "16px", display: "inline-flex" }}>
            <ArrowLeft size={16} /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Back button */}
      <div>
        <Link 
          to="/orders" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--text-secondary)", 
            textDecoration: "none", 
            fontWeight: 600,
            fontSize: "0.875rem"
          }}
        >
          <ArrowLeft size={16} /> Back to Orders List
        </Link>
      </div>

      {/* Grid: Order summary & Customer info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        
        {/* Order Info Card */}
        <Card title="Order Specifications">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Order ID</span>
              <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>#{order.id}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Date Placed</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                <Calendar size={14} />
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--surface-border)", paddingTop: "16px" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Total Value</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", fontFamily: "'Outfit'" }}>
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Customer Info Card */}
        <Card title="Customer Profile">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div 
                style={{ 
                  width: "42px", 
                  height: "42px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--primary-light)", 
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700
                }}
              >
                {order.customer?.full_name?.split(" ").map((n) => n[0]).join("")}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {order.customer?.full_name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  Customer ID: #{order.customer?.id}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.875rem", borderTop: "1px solid var(--surface-border)", paddingTop: "14px", marginTop: "4px" }}>
              <Mail size={14} />
              <a href={`mailto:${order.customer?.email}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                {order.customer?.email}
              </a>
            </div>

            {order.customer?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                <Phone size={14} />
                <span style={{ fontWeight: 500 }}>{order.customer?.phone}</span>
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* Line Items Table Card */}
      <Card title="Ordered Items Breakdown">
        <Table
          headers={tableHeaders}
          isEmpty={!order.items || order.items.length === 0}
          emptyMessage="No items in this order."
        >
          {order.items?.map((item) => {
            const subtotal = Number(item.unit_price) * item.quantity;
            return (
              <tr key={item.id} className="table-row">
                <td className="td" style={{ fontWeight: 600 }}>
                  {item.product?.name || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Product deleted</span>}
                </td>
                <td className="td">
                  <code style={{ fontSize: "0.8125rem", padding: "2px 6px", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                    {item.product?.sku || "N/A"}
                  </code>
                </td>
                <td className="td" style={{ fontWeight: 500 }}>
                  ${Number(item.unit_price).toFixed(2)}
                </td>
                <td className="td" style={{ fontWeight: 700 }}>
                  {item.quantity}
                </td>
                <td className="td" style={{ fontWeight: 700, textAlign: "right", color: "var(--text-primary)" }}>
                  ${subtotal.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

    </div>
  );
};

export default OrderDetails;
