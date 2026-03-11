"use client";

import { useGetMe } from "@/feature/auth/queries";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLogin, setLogout } = useAuthStore();
  const { data: serverUser, isError } = useGetMe();

  useEffect(() => {
    if (serverUser) {
      setLogin(serverUser, localStorage.getItem("accessToken") || "");
    }
  }, [serverUser, setLogin]);

  useEffect(() => {
    if (isError) {
      setLogout();
    }
  }, [isError, setLogout]);

  return <>{children}</>;
}
