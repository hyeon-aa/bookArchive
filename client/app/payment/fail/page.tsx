"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const message = searchParams.get("message");
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">결제가 실패했어요</h1>

      <p className="text-gray-600 mb-2">
        {message || "결제 중 문제가 발생했습니다."}
      </p>

      {code && <p className="text-sm text-gray-400 mb-6">에러코드: {code}</p>}

      <button
        onClick={() => router.push("/dashboard")}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
      >
        다시 시도하기
      </button>
    </div>
  );
}
