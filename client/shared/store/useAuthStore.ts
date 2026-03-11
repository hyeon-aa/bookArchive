import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  nickname: string;
  isMember: boolean;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  setLogin: (user: User, token: string) => void;
  setLogout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setLogin: (user, token) => {
        localStorage.setItem("accessToken", token);
        set({ user, isLoggedIn: true });
      },
      setLogout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, isLoggedIn: false });
      },
    }),
    { name: "auth-storage" }
  )
);
