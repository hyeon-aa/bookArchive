"use client";

import { authApi } from "@/feature/auth/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "../(auth)/AuthLayout";

export default function SignUpPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authApi.signUp(form);
    router.push("/login");
  };

  return (
    <AuthLayout
      title="회원가입"
      description="당신의 독서 여정을 시작하세요"
      footer={
        <>
          <span className="text-gray-500">이미 계정이 있으신가요? </span>
          <button
            onClick={() => router.push("/login")}
            className="text-[#7C9885] font-semibold hover:underline"
          >
            로그인
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            placeholder="홍길동"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

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
            placeholder="8자 이상 입력해주세요"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:border-[#7C9885] transition-colors"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="w-full mt-8 bg-[#7C9885] text-white py-4 rounded-lg font-semibold text-base hover:bg-[#5E7365] active:scale-[0.98] transition-all">
          가입하기
        </button>
      </form>
    </AuthLayout>
  );
}
