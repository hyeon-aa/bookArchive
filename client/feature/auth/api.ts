import { api } from "../../lib/api";
import {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  UserResponse,
} from "./type";

export const authApi = {
  login: async (body: LoginRequest) => {
    const data = await api.post<LoginResponse>("/auth/login", body);
    return data;
  },

  signUp: async (body: SignUpRequest): Promise<void> => {
    await api.post("/auth/signup", body);
  },

  getUserInfo: async () => {
    const data = await api.get<UserResponse>("auth/me");
    return data;
  },
};
