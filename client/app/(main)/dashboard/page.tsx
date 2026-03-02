"use client";

import { useEffect, useState } from "react";

import { dashboardApi } from "@/feature/dashboard/api";
import { EmotionSummary } from "@/feature/dashboard/components/EmotionSummary";
import { MonthlyChart } from "@/feature/dashboard/components/MonthlyChart";
import { ReadingOverView } from "@/feature/dashboard/components/ReadingOverView";
import { DashboardData } from "@/feature/dashboard/type";
import { paymentApi } from "@/feature/payment/api";
import { loadTossPayments } from "@tosspayments/payment-sdk";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getStats();
        setData(res);
      } catch (error) {
        console.error("대시보드 로딩 실패:", error);
      }
    };
    fetchDashboard();
  }, []);

  const handleMembershipSignup = async () => {
    try {
      const orderId = `order-${Math.random().toString(36).slice(2, 11)}`;

      const readyData = await paymentApi.ready({
        orderId,
        amount: 3900,
        orderName: "북아카이브 멤버십",
      });

      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      await tossPayments.requestPayment("카드", {
        amount: 3900,
        orderId: readyData.orderId,
        orderName: "북아카이브 멤버십",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 오류:", error);
    }
  };

  if (!data) return <div className="p-10">불러오는 중...</div>;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
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

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <ReadingOverView
          totalCount={data.totalCount}
          doneCount={data.doneCount}
          readingCount={data.readingCount}
          completionRate={data.completionRate}
        />
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold mb-3">📊 월별 독서 통계</h3>
        <MonthlyChart data={data.monthlyStats} />
      </section>
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold mb-3">💬 감정 분포</h3>
        <EmotionSummary emotionStats={data.emotionStats} />
      </section>
    </div>
  );
}
