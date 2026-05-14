import { create } from "zustand";
import api from "../utils/api";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  unreadNotifications: 0,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login/", credentials);
      const { access, user } = response.data;

      localStorage.setItem("token", access);
      localStorage.setItem("user", JSON.stringify(user));
      set({
        user: user,
        token: access,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Fetch unread count after login
      useAuthStore.getState().fetchUnreadCount();
      
      return true;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
        isLoading: false,
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register/", userData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Registration failed.",
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false, unreadNotifications: 0 });
  },

  // Used for fetching initial user profile if token exists
  fetchProfile: async () => {
    if (!localStorage.getItem("token")) return;
    
    try {
      const response = await api.get("/profile/my_profile/");
      const userData = response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
      
      // Fetch unread count
      useAuthStore.getState().fetchUnreadCount();
    } catch (error) {
      console.error("Failed to fetch profile", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread_count/');
      set({ unreadNotifications: response.data.unread_count });
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  },
}));

// Listen for unauthorized events to auto logout
if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().logout();
  });
}
