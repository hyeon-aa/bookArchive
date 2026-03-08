import { api } from "../../lib/api";
import { LoginRequest, LoginResponse, SignUpRequest } from "./type";

export const authApi = {
  login: async (body: LoginRequest) => {
    const data = await api.post<LoginResponse>("/auth/login", body);

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  signUp: async (body: SignUpRequest): Promise<void> => {
    await api.post("/auth/signup", body);
  },
};
