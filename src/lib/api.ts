import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Add a request interceptor to handle caching and JWT token
api.interceptors.request.use(
  (config) => {
    // Check cache for GET requests
    if (config.method === "get" && config.url) {
      const cached = cache.get(config.url);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return a custom adapter that resolves with the cached data
        config.adapter = async () => {
          return {
            data: cached.data,
            status: 200,
            statusText: "OK (from cache)",
            headers: {},
            config,
          } as any;
        };
      }
    }

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

// Add a response interceptor to populate cache and handle token expiry
api.interceptors.response.use(
  (response) => {
    // Populate cache for GET requests
    if (response.config.method === "get" && response.config.url) {
      cache.set(response.config.url, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isLoginPage = window.location.pathname === "/login";
      const hasToken = !!localStorage.getItem("token");

      if (hasToken) {
        localStorage.removeItem("token");
        if (!isLoginPage) {
          window.location.href = "/login?error=session_expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
