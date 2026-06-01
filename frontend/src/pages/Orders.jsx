import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, Calendar, User, ShoppingBag, PlusCircle, MinusCircle, AlertCircle } from "lucide-react";

import { getOrders, createOrder, deleteOrder } from "../services/orderService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";

const Orders = () => {
  const queryClient = useQueryClient();
  
  // Modals States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Form State for Order creation
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState([{ product_id: "", quantity: 1 }]);
  const [runningTotal, setRunningTotal] = useState(0);

  // 1. Fetch Orders, Customers, and Products
  const { data: orders = [], isLoading: isOrdersLoading, error: ordersError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: customers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
    enabled: isCreateModalOpen,
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: isCreateModalOpen,
  });

  // Calculate Running Total Preview Client-side
  useEffect(() => {
    let total = 0;
    orderItems.forEach((item) => {
      if (item.product_id) {
        const prod = products.find((p) => p.id === Number(item.product_id));
        if (prod) {
          total += Number(prod.price) * item.quantity;
        }
      }
    });
    setRunningTotal(total);
  }, [orderItems, products]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Order placed successfully!");
      setIsCreateModalOpen(false);
      resetOrderForm();
    },
    onError: (err) => {
      // Handles FastAPI detailed stock check dictionary errors
      const detail = err.message;
      toast.error(detail || "Failed to place order.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Order canceled and inventory stock restored!");
      setIsDeleteModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel order.");
    },
  });

  const resetOrderForm = () => {
    setSelectedCustomerId("");
    setOrderItems([{ product_id: "", quantity: 1 }]);
  };

  const handleCreateOpen = () => {
    resetOrderForm();
    setIsCreateModalOpen(true);
  };

  const handleDeleteOpen = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleAddItemLine = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1 }]);
  };

  const handleRemoveItemLine = (index) => {
    const list = [...orderItems];
    list.splice(index, 1);
    setOrderItems(list);
  };

  const handleItemChange = (index, field, value) => {
    const list = [...orderItems];
    list[index][field] = value;
    setOrderItems(list);
  };

  const handlePlaceOrderSubmit = () => {
    // Form Validations
    if (!selectedCustomerId) {
      toast.error("Please select a customer.");
      return;
    }

    if (orderItems.some((item) => !item.product_id)) {
      toast.error("Please select a product for all lines.");
      return;
    }

    // Prepare payload
    const payload = {
      customer_id: Number(selectedCustomerId),
      items: orderItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity)
      }))
    };

    // Check stock locally first for helper UX warnings
    let stockErrors = [];
    orderItems.forEach((item) => {
      const prod = products.find((p) => p.id === Number(item.product_id));
      if (prod && prod.stock_quantity < item.quantity) {
        stockErrors.push(`Requested ${item.quantity} units of '${prod.name}' but only ${prod.stock_quantity} are in stock.`);
      }
    });

    if (stockErrors.length > 0) {
      toast.error(stockErrors[0]);
      return;
    }

    createMutation.mutate(payload);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteMutation.mutate(orderToDelete.id);
    }
  };

  const tableHeaders = [
    { label: "Order ID", style: { width: "15%" } },
    { label: "Date Placed", style: { width: "25%" } },
    { label: "Total Amount", style: { width: "20%" } },
    { label: "Items Count", style: { width: "20%" } },
    { label: "Actions", style: { width: "20%", textAlign: "right" } },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header and Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          Manage placed orders & fulfillment
        </h3>
        <Button onClick={handleCreateOpen}>
          <Plus size={18} />
          Create Order
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        {ordersError ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--danger)", padding: "20px" }}>
            <AlertCircle size={24} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Error loading orders</h4>
              <p style={{ fontSize: "0.875rem", marginTop: "2px" }}>{ordersError.message}</p>
            </div>
          </div>
        ) : (
          <Table
            headers={tableHeaders}
            isLoading={isOrdersLoading}
            isEmpty={orders.length === 0}
            emptyMessage="No orders found. Create your first order to get started."
          >
            {orders.map((order) => (
              <tr key={order.id} className="table-row">
                <td className="td" style={{ fontWeight: 700 }}>
                  #{order.id}
                </td>
                <td className="td">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    <Calendar size={14} />
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="td" style={{ fontWeight: 700, color: "var(--primary)" }}>
                  ${Number(order.total_amount).toFixed(2)}
                </td>
                <td className="td" style={{ fontWeight: 600 }}>
                  {order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0} units
                </td>
                <td className="td" style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    <Link
                      to={`/orders/${order.id}`}
                      title="View Order Details"
                      style={{
                        color: "var(--text-secondary)",
                        padding: "6px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      title="Cancel Order & Restock"
                      onClick={() => handleDeleteOpen(order)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--danger)",
                        padding: "6px",
                        borderRadius: "6px",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "var(--danger-light)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Place Order Composer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Compose New Customer Order"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <div style={{ marginLeft: "auto", marginRight: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>PREVIEW TOTAL:</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)", fontFamily: "'Outfit'" }}>
                ${runningTotal.toFixed(2)}
              </span>
            </div>
            <Button 
              onClick={handlePlaceOrderSubmit} 
              isLoading={createMutation.isPending}
            >
              Place Order
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Customer Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} /> Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="form-input"
            >
              <option value="">-- Choose a Customer from Registry --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Items Composer List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShoppingBag size={14} /> Order Line Items
            </label>
            
            {orderItems.map((item, idx) => {
              const selectedProd = products.find((p) => p.id === Number(item.product_id));
              const isOutOfStock = selectedProd && selectedProd.stock_quantity < item.quantity;
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    display: "flex", 
                    gap: "12px", 
                    alignItems: "flex-start", 
                    backgroundColor: "#f8fafc", 
                    padding: "16px", 
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--surface-border)"
                  }}
                >
                  {/* Select Product */}
                  <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(idx, "product_id", e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${Number(p.price).toFixed(2)}) [Stock: {p.stock_quantity}]
                        </option>
                      ))}
                    </select>
                    {selectedProd && (
                      <span style={{ fontSize: "0.75rem", color: isOutOfStock ? "var(--danger)" : "var(--text-secondary)", fontWeight: 500 }}>
                        Available Stock: {selectedProd.stock_quantity} units
                      </span>
                    )}
                  </div>

                  {/* Quantity Input */}
                  <div style={{ width: "120px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Math.max(1, Number(e.target.value)))}
                    />
                  </div>

                  {/* Row total preview */}
                  <div style={{ width: "100px", padding: "10px 0", fontWeight: 700, textAlign: "right" }}>
                    ${selectedProd ? (Number(selectedProd.price) * item.quantity).toFixed(2) : "0.00"}
                  </div>

                  {/* Remove line */}
                  <button
                    disabled={orderItems.length === 1}
                    onClick={() => handleRemoveItemLine(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: orderItems.length === 1 ? "var(--text-muted)" : "var(--danger)",
                      cursor: orderItems.length === 1 ? "not-allowed" : "pointer",
                      padding: "8px"
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleAddItemLine}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px",
                border: "2px dashed var(--surface-border)",
                backgroundColor: "transparent",
                color: "var(--primary)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => e.target.style.borderColor = "var(--primary)"}
              onMouseLeave={(e) => e.target.style.borderColor = "var(--surface-border)"}
            >
              <PlusCircle size={14} /> Add Line Item
            </button>
          </div>

        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Cancel Order & Restore Inventory"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Back
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Cancel Order
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Are you sure you want to cancel and delete order <strong>#{orderToDelete?.id}</strong>?
          </p>
          <p style={{ color: "var(--success)", fontSize: "0.8125rem", fontWeight: 600 }}>
            ✨ All associated products will have their stock levels restored automatically.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default Orders;
