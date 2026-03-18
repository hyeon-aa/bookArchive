"use client";

import { useModal } from "@/shared/hooks/useModal";
import { useTossPayments } from "@/shared/hooks/useTossPayments";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { X } from "lucide-react";

export function PaymentModal() {
  const { close } = useModal();
  const { user } = useAuthStore();
  const { amount, isReady, requestPayment } = useTossPayments(user?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={close}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-8 pr-10">멤버십 결제</h3>

        <div className="space-y-2">
          <div id="payment-method" className="w-full" />
          <div id="agreement" className="w-full" />
        </div>

        <button
          onClick={requestPayment}
          disabled={!isReady}
          className="w-full mt-8 bg-[#7C9885] hover:bg-[#6b8574] text-white py-4 rounded-2xl font-semibold text-lg transition-all disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isReady
            ? `${amount.toLocaleString()}원 결제하기`
            : "결제창 로딩 중..."}
        </button>
      </div>
    </div>
  );
}
