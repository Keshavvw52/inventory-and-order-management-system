export const getLowStockStatus = (quantity) => {
  if (quantity <= 5) {
    return { label: "Critical", variant: "danger" };
  }

  if (quantity <= 10) {
    return { label: "Low", variant: "warning" };
  }

  return { label: "Healthy", variant: "success" };
};

export const getInventoryBadge = (quantity) => {
  if (quantity <= 0) {
    return { label: "Out of Stock", variant: "danger" };
  }

  if (quantity <= 10) {
    return { label: "Low Stock", variant: "warning" };
  }

  return { label: "In Stock", variant: "success" };
};

export const orderStatusOptions = [
  { value: "placed", label: "Placed", variant: "info" },
  { value: "processing", label: "Processing", variant: "warning" },
  { value: "shipped", label: "Shipped", variant: "primary" },
  { value: "delivered", label: "Delivered", variant: "success" },
];

export const getOrderStatus = (status) => {
  const normalizedStatus = String(status || "placed").toLowerCase();
  return orderStatusOptions.find((option) => option.value === normalizedStatus) || orderStatusOptions[0];
};
