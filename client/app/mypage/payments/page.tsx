"use client";

import { useCancelPayment, useGetMyPayments } from "@/feature/payment/queries";
import { myPaymentsResponse } from "@/feature/payment/type";
import {
  PAYMENT_STATUS_CONFIG,
  PaymentStatus,
} from "@/shared/constants/payment_status";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronLeft,
  CreditCard,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentHistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useGetMyPayments();
  const { mutate: cancelPayment, isPending: isCancelling } = useCancelPayment();

  const handleCancel = (paymentKey: string | null) => {
    if (!paymentKey) {
      alert("취소 가능한 정보가 없습니다.");
      return;
    }

    cancelPayment(
      { paymentKey, cancelReason: "사용자 직접 취소" },
      {
        onSuccess: () => {
          alert("정상적으로 취소되었습니다.");
          queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
        onError: (err) => {
          alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[rgb(var(--primary-sage))] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
      <header className="bg-white px-4 py-3 sticky top-0 z-20 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">결제 내역 관리</h1>
      </header>

      <main className="p-6 space-y-6">
        {payments && payments.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-medium">
            <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
            <p>결제 내역이 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments?.map((item: myPaymentsResponse) => {
              const statusMeta =
                PAYMENT_STATUS_CONFIG[item.status as PaymentStatus] ||
                PAYMENT_STATUS_CONFIG.FAILED;

              return (
                <div
                  key={item.orderId}
                  className="border border-gray-100 rounded-[24px] p-5 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[rgb(var(--primary-sage))]">
                      <ReceiptText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">
                        {item.orderName || "멤버십 정기권"}
                      </h3>
                      <p className="text-[rgb(var(--primary-sage))] font-black">
                        {item.amount?.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {item.status === "DONE" && (
                    <button
                      onClick={() => handleCancel(item.paymentKey)}
                      disabled={isCancelling}
                      className="w-full py-3.5 bg-red-50 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? "처리 중..." : "결제 취소하기"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-2xl flex gap-3 text-[11px] text-gray-400 leading-relaxed border border-gray-100">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-gray-300" />
          <p>
            결제 후 7일 이내에만 취소가 가능하며, <br />
            이미 프리미엄 서비스를 이용한 경우 취소가 제한될 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
