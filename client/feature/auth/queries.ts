import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { authKeys } from "./keys";
import { LoginForm, SignUpForm } from "./type";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: LoginForm) => authApi.login(form),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: (form: SignUpForm) => authApi.signUp(form),
    onSuccess: () => {
      console.log("회원가입 성공!");
    },
  });
};
