"use client";

import { useSignUp } from "@/feature/auth/queries";
import { SignUpRequest } from "@/feature/auth/type";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../(auth)/AuthLayout";

export default function SignUpPage() {
  const router = useRouter();
  const { mutate: signUp, isPending } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpRequest>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpRequest) => {
    signUp(data, {
      onSuccess: () => {
        alert("회원가입이 완료되었습니다. 로그인해주세요!");
        router.push("/login");
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

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
          <input
            {...register("name", { required: "이름을 입력해주세요" })}
            disabled={isPending}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors disabled:bg-gray-50"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
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
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors disabled:bg-gray-50"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            {...register("password", {
              required: "비밀번호를 입력해주세요",
              minLength: { value: 8, message: "최소 8자 이상 입력해주세요" },
            })}
            type="password"
            placeholder="8자 이상 입력해주세요"
            disabled={isPending}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors disabled:bg-gray-50"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
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
