"use client";

import { useModal } from "@/shared/hooks/useModal";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { PaymentModal } from "./PaymentModal";

export function MembershipBanner() {
  const { user, isLoggedIn } = useAuthStore();
  const { open } = useModal();

  const handleMembershipSignup = () => {
    open(() => <PaymentModal />);
  };

  if (isLoggedIn && user?.isMember) {
    return null;
  }

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
        className="w-full bg-[#7C9885] hover:bg-[#6E8776] text-white py-3 rounded-xl font-semibold transition"
      >
        멤버십 시작하기
      </button>
    </section>
  );
}
