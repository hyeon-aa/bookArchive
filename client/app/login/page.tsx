"use client";

import { useLogin } from "@/feature/auth/queries";
import { LoginRequest } from "@/feature/auth/type";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthLayout } from "../(auth)/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginRequest) => {
    login(data, {
      onSuccess: () => {
        router.push("/");
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  return (
    <AuthLayout
      title="로그인"
      description="다시 만나서 반가워요"
      footer={
        <>
          <span className="text-gray-500">아직 계정이 없으신가요? </span>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-[#7C9885] font-semibold hover:underline"
          >
            회원가입
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            {...register("email", { required: "이메일을 입력해주세요" })}
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
            {...register("password", { required: "비밀번호를 입력해주세요" })}
            type="password"
            placeholder="비밀번호를 입력하세요"
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
          {isPending ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </AuthLayout>
  );
}
