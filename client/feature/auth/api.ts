import { api } from "../../lib/api";
import { LoginForm, LoginResponse, SignUpForm } from "./type";

export const authApi = {
  login: async (form: LoginForm): Promise<LoginResponse> => {
    const data: LoginResponse = await api.post("/auth/login", form);

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  signUp: async (form: SignUpForm) => {
    return await api.post("/auth/signup", form);
  },
};
