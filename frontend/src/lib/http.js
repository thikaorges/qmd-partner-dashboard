import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

export const TOKEN_KEY = "qmd_auth_token";
export const USER_KEY = "qmd_auth_user";

// Shared axios client — every request auto-attaches the bearer token.
const http = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — clear auth + redirect to login (unless we're already there).
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const currentPath = window.location.pathname;
      // Do NOT wipe on login errors: only on protected endpoints
      const url = error?.config?.url || "";
      if (!url.includes("/auth/login") && currentPath !== "/login") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default http;

// ---------- Auth API ----------
export const authApi = {
  login: async (email, password) => {
    const { data } = await http.post("/auth/login", { email, password });
    return data;
  },
  me: async () => {
    const { data } = await http.get("/auth/me");
    return data;
  },
  changePassword: async (current_password, new_password) => {
    const { data } = await http.post("/auth/change-password", {
      current_password,
      new_password,
    });
    return data;
  },
  listUsers: async () => {
    const { data } = await http.get("/auth/users");
    return data;
  },
};

// ---------- Utility ----------
export function formatApiError(error, fallback = "Something went wrong. Please try again.") {
  const detail = error?.response?.data?.detail;
  if (detail == null) return error?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  }
  if (typeof detail?.msg === "string") return detail.msg;
  return String(detail);
}
