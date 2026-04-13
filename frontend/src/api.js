import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://app-store-backend-dbci.onrender.com",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => {
    const form = new URLSearchParams();
    form.append("username", data.username);
    form.append("password", data.password);
    return api.post("/auth/login", form);
};

export const getApps = (category) =>
    api.get("/apps/", { params: category ? { category } : {} });
export const getApp = (id) => api.get(`/apps/${id}`);
export const purchaseApp = (id) => api.post(`/apps/${id}/purchase`);

export const getMe = () => api.get("/users/me");
export const getPurchases = () => api.get("/users/me/purchases");
export const submitApp = (data) => api.post("/apps/submit", data);