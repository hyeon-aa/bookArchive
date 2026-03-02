// lib/auth.ts
import { apiFetch } from "../../lib/api";
import { LoginForm, SignUpForm } from "./type";

// 유저 타입 정의 (필요시)
export interface User {
  id: string;
  email: string;
  nickname: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: async (form: LoginForm): Promise<LoginResponse> => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  signUp: async (form: SignUpForm) => {
    return await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },
};
