"use client";

import { authKeys } from "@/feature/auth/keys";
import { paymentApi } from "@/feature/payment/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = Number(searchParams.get("amount"));

      if (!paymentKey || !orderId || !amount) return;

      try {
        await paymentApi.confirm({
          paymentKey,
          orderId,
          amount,
        });

        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
      } catch (error) {
        console.error("결제 승인 중 오류 발생:", error);
      }
    };

    confirmPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">🎉 결제 완료!</h1>
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold"
      >
        홈으로 가기
      </button>
    </div>
  );
}
