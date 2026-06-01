import apiClient from "./api";

export const getOrders = () => apiClient.get("/orders/");
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);
export const createOrder = (data) => apiClient.post("/orders/", data);
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);
