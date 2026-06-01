import apiClient from "./api";

export const getDashboardStats = () => apiClient.get("/dashboard/stats");
