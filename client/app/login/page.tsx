"use client";

import { authApi } from "@/feature/auth/api";
import { LoginForm } from "@/feature/auth/type";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "../(auth)/AuthLayout";

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await authApi.login(form);
    router.push("/");
  };

  return (
    <AuthLayout
      title="로그인"
      description="다시 만나서 반가워요"
      footer={
        <>
          <span className="text-gray-500">아직 계정이 없으신가요? </span>
          <button
            onClick={() => router.push("/signup")}
            className="text-[#7C9885] font-semibold hover:underline"
          >
            회원가입
          </button>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="w-full mt-8 bg-[#7C9885] text-white py-4 rounded-lg font-semibold text-base hover:bg-[#5E7365] active:scale-[0.98] transition-all">
          로그인
        </button>
      </form>
    </AuthLayout>
  );
}
