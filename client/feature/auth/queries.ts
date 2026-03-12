import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { authApi } from "./api";
import { authKeys } from "./keys";
import { LoginRequest, SignUpRequest } from "./type";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: LoginRequest) => authApi.login(form),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: (form: SignUpRequest) => authApi.signUp(form),
    onSuccess: () => {
      console.log("회원가입 성공!");
    },
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getUserInfo(),
    enabled: typeof window !== "undefined" && !!getCookie("accessToken"),
  });
};
