import axios from "axios";

const apiClient = axios.create({
  // Set at build time. In production this is "/api" when Vercel proxies the
  // API (recommended), or the full https://.../api URL of the backend.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

export default apiClient;