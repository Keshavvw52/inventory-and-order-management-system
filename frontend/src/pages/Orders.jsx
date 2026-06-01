import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Calendar,
  Eye,
  Plus,
  PlusCircle,
  ShoppingBag,
  Trash2,
  XCircle,
} from "lucide-react";

import { getOrders, createOrder, deleteOrder, updateOrderStatus } from "../services/orderService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { getInventoryBadge, getOrderStatus, orderStatusOptions } from "../utils/status";

const blankLineItem = { product_id: "", quantity: 1 };

const Orders = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState([{ ...blankLineItem }]);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading: isOrdersLoading, error: ordersError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
    enabled: isCreateModalOpen,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: isCreateModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Order placed successfully.");
      resetOrderForm();
      setIsCreateModalOpen(false);
    },
    onError: (requestError) => {
      const validationMessage = requestError.validationErrors?.[0];
      toast.error(validationMessage || requestError.message || "Failed to place order.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      queryClient.invalidateQueries(["recentOrders"]);
      setSelectedOrder(updatedOrder);
      toast.success("Order status updated.");
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to update order status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      toast.success("Order cancelled and stock restored.");
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    },
    onError: (requestError) => {
      toast.error(requestError.message || "Failed to cancel order.");
    },
  });

  const selectedCustomer = customers.find((customer) => customer.id === Number(selectedCustomerId));

  const orderValidation = useMemo(() => {
    const warnings = [];
    let total = 0;

    orderItems.forEach((item, index) => {
      if (!item.product_id) {
        warnings.push(`Select a product for line ${index + 1}.`);
        return;
      }

      const product = products.find((entry) => entry.id === Number(item.product_id));
      if (!product) {
        warnings.push(`Product on line ${index + 1} is unavailable.`);
        return;
      }

      if (item.quantity <= 0) {
        warnings.push(`Quantity on line ${index + 1} must be at least 1.`);
      }

      if (product.stock_quantity < item.quantity) {
        warnings.push(`Only ${product.stock_quantity} units of ${product.name} are available.`);
      }

      total += Number(product.price) * item.quantity;
    });

    return {
      warnings,
      total,
      canSubmit: selectedCustomerId && orderItems.length > 0 && warnings.length === 0,
    };
  }, [orderItems, products, selectedCustomerId]);

  const resetOrderForm = () => {
    setSelectedCustomerId("");
    setOrderItems([{ ...blankLineItem }]);
  };

  const handleItemChange = (index, field, value) => {
    setOrderItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "quantity" ? Math.max(1, Number(value || 1)) : value,
            }
          : item,
      ),
    );
  };

  const tableHeaders = [
    { label: "Order ID", style: { width: "12%" } },
    { label: "Customer", style: { width: "26%" } },
    { label: "Date", style: { width: "20%" } },
    { label: "Items", style: { width: "12%" } },
    { label: "Amount", style: { width: "15%" } },
    { label: "Status", style: { width: "15%" } },
    { label: "Actions", style: { width: "10%", textAlign: "right" } },
  ];

  return (
    <div className="page-stack animate-fade-in">
      <PageHeader
        eyebrow="Sales / Orders"
        title="Order Operations"
        description="Place customer orders, review fulfillment history, and monitor active transaction volume."
        meta={<div className="summary-inline"><span>{orders.length} total orders</span></div>}
        action={
          <Button onClick={() => { resetOrderForm(); setIsCreateModalOpen(true); }}>
            <Plus size={16} />
            Create Order
          </Button>
        }
      />

      <Card title="Order Queue" subtitle="Review every order with customer context, item counts, and operational status.">
        {ordersError ? (
          <ErrorState title="Unable to load orders" message={ordersError.message} />
        ) : (
          <Table
            headers={tableHeaders}
            isLoading={isOrdersLoading}
            isEmpty={orders.length === 0}
            emptyTitle="No orders yet"
            emptyMessage="Create your first order to begin tracking sales and inventory consumption."
            emptyIcon={ShoppingBag}
            emptyAction={<Button onClick={() => setIsCreateModalOpen(true)}>Create Order</Button>}
          >
            {orders.map((order) => {
              const status = getOrderStatus(order.status);
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <tr key={order.id} className="table-row">
                  <td className="td">
                    <span className="entity-title">#{order.id}</span>
                  </td>
                  <td className="td">
                    <div className="entity-cell">
                      <span className="entity-title">{order.customer?.full_name ?? "Unknown customer"}</span>
                      <span className="entity-meta">{order.customer?.email ?? "No email"}</span>
                    </div>
                  </td>
                  <td className="td">
                    <div className="stack-inline compact">
                      <Calendar size={14} />
                      {formatDateTime(order.created_at)}
                    </div>
                  </td>
                  <td className="td" style={{ fontWeight: 700 }}>
                    {itemCount} items
                  </td>
                  <td className="td" style={{ fontWeight: 800, color: "var(--primary)" }}>
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="td">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="td" style={{ textAlign: "right" }}>
                    <div className="row-actions">
                      <button className="table-icon-button" onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }} title="View order details">
                        <Eye size={16} />
                      </button>
                      <button className="table-icon-button danger" onClick={() => { setOrderToDelete(order); setIsDeleteModalOpen(true); }} title="Cancel order">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create customer order"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!orderValidation.canSubmit) {
                toast.error(orderValidation.warnings[0] || "Resolve order warnings before submitting.");
                return;
              }

              createMutation.mutate({
                customer_id: Number(selectedCustomerId),
                items: orderItems.map((item) => ({
                  product_id: Number(item.product_id),
                  quantity: Number(item.quantity),
                })),
              });
            }} isLoading={createMutation.isPending} disabled={!orderValidation.canSubmit}>
              Place Order
            </Button>
          </>
        }
      >
        <div className="create-order-layout">
          <div className="create-order-form">
            <div className="form-group">
              <label className="form-label">Customer</label>
              <select className="form-input" value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="order-line-items">
              <div className="section-header-inline">
                <div>
                  <h4>Order Items</h4>
                  <p>Build the order with inventory-aware validation.</p>
                </div>
                <Button variant="outline" onClick={() => setOrderItems((current) => [...current, { ...blankLineItem }])}>
                  <PlusCircle size={16} />
                  Add Line
                </Button>
              </div>

              {orderItems.map((item, index) => {
                const product = products.find((entry) => entry.id === Number(item.product_id));
                const inventoryBadge = product ? getInventoryBadge(product.stock_quantity) : null;
                const isInsufficient = product && product.stock_quantity < item.quantity;

                return (
                  <div className="order-line-card" key={`${index}-${item.product_id}`}>
                    <div className="order-line-grid">
                      <div className="form-group">
                        <label className="form-label">Product</label>
                        <select
                          className="form-input"
                          value={item.product_id}
                          onChange={(event) => handleItemChange(index, "product_id", event.target.value)}
                        >
                          <option value="">Select product</option>
                          {products.map((productOption) => (
                            <option key={productOption.id} value={productOption.id}>
                              {productOption.name} ({formatCurrency(productOption.price)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          value={item.quantity}
                          onChange={(event) => handleItemChange(index, "quantity", event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="order-line-footer">
                      <div className="stack-inline">
                        {inventoryBadge ? <Badge variant={inventoryBadge.variant}>{inventoryBadge.label}</Badge> : null}
                        {product ? <span className="entity-meta">Available: {product.stock_quantity}</span> : null}
                      </div>
                      <div className="stack-inline">
                        <strong>{product ? formatCurrency(Number(product.price) * item.quantity) : formatCurrency(0)}</strong>
                        <button
                          className="table-icon-button danger"
                          disabled={orderItems.length === 1}
                          onClick={() => setOrderItems((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>

                    {isInsufficient ? (
                      <div className="inline-warning">
                        <AlertTriangle size={14} />
                        Requested quantity exceeds available stock.
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <Card title="Order Summary" className="summary-card" bodyClassName="summary-card-body">
            <div className="summary-stack">
              <div className="summary-section">
                <span className="summary-label">Customer</span>
                <strong>{selectedCustomer?.full_name || "Select a customer"}</strong>
                <span className="entity-meta">{selectedCustomer?.email || "No customer selected yet"}</span>
              </div>

              <div className="summary-section">
                <span className="summary-label">Items</span>
                <strong>{orderItems.length} lines</strong>
                <span className="entity-meta">
                  {orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} total units
                </span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatCurrency(orderValidation.total)}</strong>
              </div>

              {orderValidation.warnings.length > 0 ? (
                <div className="warning-panel">
                  <div className="stack-inline">
                    <AlertTriangle size={16} />
                    <strong>Inventory warnings</strong>
                  </div>
                  <ul>
                    {orderValidation.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Badge variant="success">Ready to submit</Badge>
              )}
            </div>
          </Card>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Order #${selectedOrder?.id ?? ""}`}
        size="lg"
      >
        {selectedOrder ? (
          <div className="details-drawer">
              <div className="details-grid">
                <div className="details-block">
                  <span className="summary-label">Customer</span>
                  <strong>{selectedOrder.customer?.full_name ?? "Unknown customer"}</strong>
                  <span className="entity-meta">{selectedOrder.customer?.email}</span>
                </div>
                <div className="details-block">
                  <span className="summary-label">Order Date</span>
                  <strong>{formatDateTime(selectedOrder.created_at)}</strong>
                </div>
                <div className="details-block">
                  <span className="summary-label">Status</span>
                  {(() => {
                    const status = getOrderStatus(selectedOrder.status);
                    return <Badge variant={status.variant}>{status.label}</Badge>;
                  })()}
                  <select
                    className="form-input"
                    style={{ marginTop: "8px" }}
                    value={selectedOrder.status ?? "placed"}
                    disabled={statusMutation.isPending}
                    onChange={(event) =>
                      statusMutation.mutate({
                        id: selectedOrder.id,
                        status: event.target.value,
                      })
                    }
                  >
                    {orderStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="details-block">
                  <span className="summary-label">Total</span>
                  <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                </div>
            </div>

            <div className="details-list">
              {selectedOrder.items?.map((item) => (
                <div className="details-line-item" key={item.id}>
                  <div>
                    <strong>{item.product?.name ?? "Deleted product"}</strong>
                    <div className="entity-meta">
                      {item.product?.sku ?? "No SKU"} · Qty {item.quantity}
                    </div>
                  </div>
                  <strong>{formatCurrency(Number(item.unit_price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Cancel order"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={() => orderToDelete && deleteMutation.mutate(orderToDelete.id)}
              isLoading={deleteMutation.isPending}
            >
              Cancel Order
            </Button>
          </>
        }
      >
        <div className="dialog-copy">
          <p>
            Cancel order <strong>#{orderToDelete?.id}</strong> and restore all reserved stock back into inventory?
          </p>
          <p className="dialog-warning">This action removes the order record from the system.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
