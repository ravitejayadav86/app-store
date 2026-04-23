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

      if (!isLoginPage && hasToken) {
        // Only redirect if we thought we had a token but it's rejected
        localStorage.removeItem("token");
        // We use window.location for hard redirect, but let's try to pass a message
        window.location.href = "/login?error=session_expired";
      } else if (isLoginPage && hasToken) {
        // Stuck on login with a bad token? Clear it.
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
