import { deleteCookie, setCookie } from "cookies-next";
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
        setCookie("accessToken", token, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          secure: false,
          sameSite: "lax",
        });
        set({ user, isLoggedIn: true });
      },
      setLogout: () => {
        deleteCookie("accessToken");
        set({ user: null, isLoggedIn: false });
      },
    }),
    { name: "auth-storage" }
  )
);
