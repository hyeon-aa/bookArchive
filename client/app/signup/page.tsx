"use client";

import { useSignUp } from "@/feature/auth/queries";
import { SignUpRequest } from "@/feature/auth/type";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../(auth)/AuthLayout";

interface SignUpFormValues extends SignUpRequest {
  passwordConfirm: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { mutate: signUp, isPending } = useSignUp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<SignUpFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const password = watch("password");

  const onSubmit = (data: SignUpFormValues) => {
    const signUpData: SignUpRequest = {
      name: data.name,
      email: data.email,
      password: data.password,
    };
    signUp(signUpData, {
      onSuccess: () => {
        alert("회원가입이 완료되었습니다. 로그인해주세요!");
        router.push("/login");
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  const isNameValid = touchedFields.name && !errors.name;
  const isEmailValid = touchedFields.email && !errors.email;
  const isPasswordValid = touchedFields.password && !errors.password;
  const isPasswordConfirmValid =
    touchedFields.passwordConfirm && !errors.passwordConfirm;

  return (
    <AuthLayout
      title="회원가입"
      description="당신의 독서 여정을 시작하세요"
      footer={
        <>
          <span className="text-gray-500">이미 계정이 있으신가요? </span>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[#7C9885] font-semibold hover:underline"
          >
            로그인
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <div className="relative">
            <input
              {...register("name", {
                required: "이름을 입력해주세요",
                minLength: { value: 2, message: "2자 이상 입력해주세요" },
              })}
              disabled={isPending}
              className={`w-full border-2 rounded-lg px-4 py-3.5 pr-11 outline-none transition-colors disabled:bg-gray-50 ${
                errors.name
                  ? "border-red-300 focus:border-red-400"
                  : isNameValid
                    ? "border-[#7C9885]"
                    : "border-gray-200 focus:border-[#7C9885]"
              }`}
            />
            {isNameValid && (
              <Check
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9885]"
              />
            )}
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <div className="relative">
            <input
              {...register("email", {
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "이메일 형식이 올바르지 않습니다",
                },
              })}
              type="email"
              placeholder="example@email.com"
              disabled={isPending}
              className={`w-full border-2 rounded-lg px-4 py-3.5 pr-11 outline-none transition-colors disabled:bg-gray-50 ${
                errors.email
                  ? "border-red-300 focus:border-red-400"
                  : isEmailValid
                    ? "border-[#7C9885]"
                    : "border-gray-200 focus:border-[#7C9885]"
              }`}
            />
            {isEmailValid && (
              <Check
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9885]"
              />
            )}
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <input
              {...register("password", {
                required: "비밀번호를 입력해주세요",
                minLength: { value: 8, message: "최소 8자 이상 입력해주세요" },
                deps: ["passwordConfirm"],
              })}
              type="password"
              placeholder="8자 이상 입력해주세요"
              disabled={isPending}
              className={`w-full border-2 rounded-lg px-4 py-3.5 pr-11 outline-none transition-colors disabled:bg-gray-50 ${
                errors.password
                  ? "border-red-300 focus:border-red-400"
                  : isPasswordValid
                    ? "border-[#7C9885]"
                    : "border-gray-200 focus:border-[#7C9885]"
              }`}
            />
            {isPasswordValid && (
              <Check
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9885]"
              />
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <div className="relative">
            <input
              {...register("passwordConfirm", {
                required: "비밀번호를 한 번 더 입력해주세요",
                validate: (value) =>
                  value === password || "비밀번호가 일치하지 않습니다",
              })}
              type="password"
              placeholder="비밀번호를 한 번 더 입력해주세요"
              disabled={isPending}
              className={`w-full border-2 rounded-lg px-4 py-3.5 pr-11 outline-none transition-colors disabled:bg-gray-50 ${
                errors.passwordConfirm
                  ? "border-red-300 focus:border-red-400"
                  : isPasswordConfirmValid
                    ? "border-[#7C9885]"
                    : "border-gray-200 focus:border-[#7C9885]"
              }`}
            />
            {isPasswordConfirmValid && (
              <Check
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9885]"
              />
            )}
          </div>
          {errors.passwordConfirm && (
            <p className="text-red-500 text-xs mt-1">
              {errors.passwordConfirm.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-8 bg-[#7C9885] text-white py-4 rounded-lg font-semibold text-base hover:bg-[#5E7365] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </AuthLayout>
  );
}
