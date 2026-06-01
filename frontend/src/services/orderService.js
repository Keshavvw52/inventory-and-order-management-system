import apiClient from "./api";

export const getOrders = () => apiClient.get("/orders/");
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);
export const createOrder = (data) => apiClient.post("/orders/", data);
export const updateOrderStatus = (id, status) => apiClient.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);
export const getRecentOrders = async (limit = 5) => {
  const orders = await apiClient.get("/orders/");
  return orders.slice(0, limit);
};
