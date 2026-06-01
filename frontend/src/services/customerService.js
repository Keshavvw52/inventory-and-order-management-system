import apiClient from "./api";

export const getCustomers = () => apiClient.get("/customers/");
export const getCustomerById = (id) => apiClient.get(`/customers/${id}`);
export const createCustomer = (data) => apiClient.post("/customers/", data);
export const updateCustomer = (id, data) => apiClient.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => apiClient.delete(`/customers/${id}`);
