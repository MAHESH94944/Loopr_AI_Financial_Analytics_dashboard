import { create } from "zustand";
import api from "../services/api";
import { shouldLogError } from "../utils/errorUtils";

export interface User {
  _id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email: string, password: string) => {
    try {
      await api.post("/api/auth/login", { email, password });
      await useAuthStore.getState().fetchUser();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as { response?: { status?: number } };
        if (errorResponse.response?.status === 429) {
          alert(
            "Too many login attempts. Please wait a minute before trying again."
          );
          return;
        }
      }
      throw err;
    }
  },
  register: async (email: string, password: string) => {
    await api.post("/api/auth/register", { email, password });
    await useAuthStore.getState().login(email, password);
  },
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err: unknown) {
      // Even if logout fails on server, clear local state
      console.warn("Logout request failed, but clearing local state:", err);
    } finally {
      set({ user: null });
    }
  },
  fetchUser: async () => {
    try {
      console.log("Fetching user...");
      const res = await api.get("/api/auth/me");
      console.log("User fetched successfully:", res.data);
      set({ user: res.data, loading: false });
    } catch (err: unknown) {
      console.log("Failed to fetch user:", err);
      set({ user: null, loading: false });
      // Only log errors that are not 401 (unauthorized is expected when not logged in)
      if (shouldLogError(err)) {
        console.error("Auth fetch error:", err);
      }
      // Re-throw the error so App.tsx can handle it for navigation
      throw err;
    }
  },
}));
