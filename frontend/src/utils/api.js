import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.VITE_DEBUG) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        token: token ? "present" : "missing",
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG) {
      console.log(`[API] Response ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_DEBUG) {
      console.error(
        `[API] Error ${error.response?.status}`,
        error.response?.data || error.message,
      );
    }

    if (error.response && error.response.status === 401) {
      console.warn(
        "[API] Unauthorized - clearing token and redirecting to login",
      );
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default api;
