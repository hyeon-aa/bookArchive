"use client";

import { useGetMe } from "@/feature/auth/queries";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { getCookie } from "cookies-next";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLogin, setLogout } = useAuthStore();
  const { data: serverUser, isError } = useGetMe();

  useEffect(() => {
    const token = getCookie("accessToken");

    if (!token) {
      setLogout();
      return;
    }

    if (serverUser) {
      setLogin(serverUser, String(token));
    }
  }, [serverUser, setLogin, setLogout]);

  useEffect(() => {
    if (isError) {
      setLogout();
    }
  }, [isError, setLogout]);

  return <>{children}</>;
}
