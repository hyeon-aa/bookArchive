"use client";

import { authKeys } from "@/feature/auth/keys";
import { paymentApi } from "@/feature/payment/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"confirming" | "success" | "error">(
    "confirming"
  );

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = Number(searchParams.get("amount"));

      if (!paymentKey || !orderId || !amount) {
        setStatus("error");
        return;
      }

      try {
        await paymentApi.confirm({ paymentKey, orderId, amount });

        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        setStatus("success");
      } catch (error) {
        console.error("결제 승인 오류:", error);
        setStatus("error");
      }
    };

    confirmPayment();
  }, [searchParams, queryClient]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f8faf9]">
      {status === "confirming" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#7a9482]/20 border-t-[#7a9482] rounded-full animate-spin" />
          <p className="text-[#7a9482] font-medium">
            결제 정보를 확인하고 있습니다...
          </p>
        </div>
      ) : status === "success" ? (
        <>
          <h1 className="text-2xl font-bold mb-6 text-[#3d4a41]">
            🎉 결제가 완료되었습니다!
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-[#7a9482] hover:bg-[#6b8272] text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-sm"
          >
            홈으로 이동하기
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500 font-bold text-lg">
            결제 확인에 실패했습니다.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            잠시 후 다시 시도하거나 고객센터로 문의해 주세요.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 underline text-xs"
          >
            홈으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
