import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isLoginPage = window.location.pathname === "/login";
      const hasToken = !!localStorage.getItem("token");

      if (hasToken) {
        localStorage.removeItem("token");
        // Only redirect if not already on login page to prevent loops
        if (!isLoginPage) {
          window.location.href = "/login?error=session_expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
