"use client";

import { usePaymentMutation } from "@/feature/payment/queries";

export function MembershipBanner() {
  const { mutateAsync: requestPayment, isPending: isPaying } =
    usePaymentMutation();

  const handleMembershipSignup = async () => {
    try {
      await requestPayment();
      console.log("결제창이 성공적으로 열렸습니다.");
    } catch (err) {
      console.error("결제 준비 중 오류:", err);
    }
  };

  return (
    <section className="rounded-2xl bg-[#F4F7F5] p-6 shadow-sm border border-[#E2E8E5]">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        📚 프리미엄 멤버십
      </h2>
      <div className="text-2xl font-bold text-gray-900 mb-4">
        ₩3,900
        <span className="text-sm font-medium text-gray-500"> / 월</span>
      </div>
      <button
        onClick={handleMembershipSignup}
        disabled={isPaying}
        className="w-full bg-[#7C9885] hover:bg-[#6E8776] text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
      >
        {isPaying ? "결제창 여는 중..." : "멤버십 시작하기"}
      </button>
    </section>
  );
}
