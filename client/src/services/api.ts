import axios from "axios";

const api = axios.create({
  baseURL: "https://loopr-ai-financial-analytics-dashboard-1.onrender.com/",
  withCredentials: true,
});

// Only attach a user-friendly message, do NOT reload or redirect here!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Don't log 401 errors as they are expected when not authenticated
      if (error.response.status !== 401) {
        error.message =
          error.response.data?.message ||
          "An error occurred. Please try again.";
      }
    } else {
      error.message = "Network error. Please check your connection.";
    }
    return Promise.reject(error);
  }
);

export default api;
