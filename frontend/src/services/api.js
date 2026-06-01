import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to format errors nicely
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "An unexpected error occurred.";
    let validationErrors = [];

    if (error.response) {
      const data = error.response.data;
      
      // Handle FastAPI / Pydantic validation errors
      if (error.response.status === 422 && data.detail) {
        errorMessage = "Validation error occurred.";
        if (Array.isArray(data.detail)) {
          validationErrors = data.detail.map((err) => `${err.loc.join(".")}: ${err.msg}`);
        } else {
          errorMessage = data.detail;
        }
      } 
      // Handle custom errors (like stock check detail dict)
      else if (data.detail) {
        if (typeof data.detail === "object") {
          errorMessage = data.detail.message || errorMessage;
          validationErrors = data.detail.errors || [];
        } else {
          errorMessage = data.detail;
        }
      }
    } else if (error.request) {
      errorMessage = "No response received from backend. Please check if backend server is running.";
    } else {
      errorMessage = error.message;
    }

    const formattedError = new Error(errorMessage);
    formattedError.status = error.response ? error.response.status : null;
    formattedError.validationErrors = validationErrors;
    
    return Promise.reject(formattedError);
  }
);

export default apiClient;
