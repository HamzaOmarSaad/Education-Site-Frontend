import axios from "axios";

const configuredUrl = import.meta.env.VITE_APPLICATION_URL?.trim();

export const api = axios.create({
  baseURL: (configuredUrl || "http://localhost:3000").replace(/\/$/, ""),
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const isAdminRequest = config.url?.includes("/admin/") || config.url?.includes("/login/admin");
  const token = localStorage.getItem(isAdminRequest ? "adminToken" : "token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function responseData<T = any>(response: { data: any }): T {
  return (response.data?.data ?? response.data) as T;
}
