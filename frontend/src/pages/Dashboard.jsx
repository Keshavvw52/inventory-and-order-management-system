import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { getDashboardStats } from "../services/dashboardService";
import { getRecentOrders } from "../services/orderService";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { formatCurrency, formatDate, formatDateTime } from "../utils/formatters";
import { getLowStockStatus, getOrderStatus } from "../utils/status";

const Dashboard = () => {
  const today = formatDate(new Date(), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const {
    data: recentOrders = [],
    isLoading: isOrdersLoading,
    error: recentOrdersError,
  } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: () => getRecentOrders(5),
  });

  const lowStockItems = stats?.low_stock_products ?? [];

  const kpiCards = [
    {
      title: "Total Products",
      value: stats?.total_products ?? 0,
      icon: Package,
      accentClass: "kpi-primary",
      helper: "Products currently in your catalog",
      trend: "Catalog looks updated",
      link: "/products",
    },
    {
      title: "Total Customers",
      value: stats?.total_customers ?? 0,
      icon: Users,
      accentClass: "kpi-success",
      helper: "Customers saved in the system",
      trend: "Customer list growing",
      link: "/customers",
    },
    {
      title: "Total Orders",
      value: stats?.total_orders ?? 0,
      icon: ShoppingCart,
      accentClass: "kpi-warning",
      helper: "Orders created so far",
      trend: "Orders coming in steadily",
      link: "/orders",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      icon: Boxes,
      accentClass: "kpi-danger",
      helper: "Products that need stock attention",
      trend: lowStockItems.length > 0 ? "Check these items soon" : "Stock is in good shape",
      link: "/products",
    },
  ];

  const lowStockHeaders = [
    { label: "Product Name", style: { width: "32%" } },
    { label: "SKU", style: { width: "18%" } },
    { label: "Stock", style: { width: "16%" } },
    { label: "Status", style: { width: "18%" } },
    { label: "Action", style: { width: "16%", textAlign: "right" } },
  ];

  const recentOrdersHeaders = [
    { label: "Order", style: { width: "15%" } },
    { label: "Customer", style: { width: "28%" } },
    { label: "Amount", style: { width: "18%" } },
    { label: "Date", style: { width: "24%" } },
    { label: "Status", style: { width: "15%" } },
  ];

  return (
    <div className="page-stack animate-fade-in">
      <PageHeader
        eyebrow="Dashboard / Overview"
        title="Inventory Overview"
        description="Quickly check stock levels, customers, and recent orders from one place."
        meta={
          <div className="page-meta-chip">
            <CalendarDays size={16} />
            {today}
          </div>
        }
      />

      <div className="kpi-grid">
        {kpiCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className={`card-hover kpi-card ${card.accentClass}`}>
              {isStatsLoading ? (
                <div style={{ display: "grid", gap: "14px" }}>
                  <div className="skeleton skeleton-text" style={{ width: "40%", height: "14px", margin: 0 }} />
                  <div className="skeleton skeleton-text" style={{ width: "55%", height: "34px", margin: 0 }} />
                  <div className="skeleton skeleton-text" style={{ width: "65%", height: "14px", margin: 0 }} />
                </div>
              ) : (
                <div className="kpi-card-content">
                  <div className="kpi-card-copy">
                    <span className="kpi-label">{card.title}</span>
                    <strong className="kpi-value">{card.value}</strong>
                    <span className="kpi-helper">{card.helper}</span>
                    <div className="kpi-footer">
                      <Badge variant="info">{card.trend}</Badge>
                      <Link to={card.link} className="inline-link">
                        View details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                  <div className="kpi-icon-shell">
                    <Icon size={24} />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <Card
          title="Low Stock Watchlist"
          subtitle="Prioritize replenishment before items become unavailable."
          headerAction={<Badge variant="warning">{lowStockItems.length} flagged</Badge>}
        >
          {statsError ? (
            <ErrorState title="Unable to load stock watchlist" message={statsError.message} />
          ) : (
            <Table
              headers={lowStockHeaders}
              isLoading={isStatsLoading}
              isEmpty={lowStockItems.length === 0}
              emptyTitle="Inventory is healthy"
              emptyMessage="No products currently need replenishment attention."
              emptyIcon={Boxes}
              skeletonRows={4}
            >
              {lowStockItems.map((product) => {
                const stockStatus = getLowStockStatus(product.stock_quantity);

                return (
                  <tr key={product.id} className="table-row">
                    <td className="td">
                      <div className="entity-cell">
                        <span className="entity-title">{product.name}</span>
                        <span className="entity-meta">Added {formatDate(product.created_at)}</span>
                      </div>
                    </td>
                    <td className="td">
                      <code className="code-pill">{product.sku}</code>
                    </td>
                    <td className="td" style={{ fontWeight: 700 }}>
                      {product.stock_quantity}
                    </td>
                    <td className="td">
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </td>
                    <td className="td" style={{ textAlign: "right" }}>
                      <Link to="/products" className="inline-action-link">
                        Edit inventory
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Card>

        <Card
          title="Recent Orders"
          subtitle="Latest submitted orders flowing through the system."
          headerAction={
            <Link to="/orders" className="inline-link">
              View all <ArrowRight size={14} />
            </Link>
          }
        >
          {recentOrdersError ? (
            <ErrorState title="Unable to load recent orders" message={recentOrdersError.message} />
          ) : (
            <Table
              headers={recentOrdersHeaders}
              isLoading={isOrdersLoading}
              isEmpty={recentOrders.length === 0}
              emptyTitle="No recent orders"
              emptyMessage="Create the first order to start populating this operational feed."
              emptyIcon={ShoppingCart}
              emptyAction={<Link to="/orders" className="btn btn-primary">Create order</Link>}
              skeletonRows={5}
            >
              {recentOrders.map((order) => {
                const status = getOrderStatus(order.status);

                return (
                  <tr key={order.id} className="table-row">
                    <td className="td">
                      <span className="entity-title">#{order.id}</span>
                    </td>
                    <td className="td">
                      <div className="entity-cell">
                        <span className="entity-title">{order.customer?.full_name ?? "Unknown customer"}</span>
                        <span className="entity-meta">{order.items?.length ?? 0} line items</span>
                      </div>
                    </td>
                    <td className="td" style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="td">{formatDateTime(order.created_at)}</td>
                    <td className="td">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
