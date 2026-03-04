"use client";

import { EmotionSummary } from "@/feature/dashboard/components/EmotionSummary";
import { MonthlyChart } from "@/feature/dashboard/components/MonthlyChart";
import { ReadingOverView } from "@/feature/dashboard/components/ReadingOverView";
import { useDashboardStats } from "@/feature/dashboard/queries";
import { MembershipBanner } from "@/feature/payment/components/MembershipBanner";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading)
    return <div className="p-10 text-center">데이터를 불러오는 중...</div>;

  if (error)
    return (
      <div className="p-10 text-center text-red-500">데이터 로드 실패</div>
    );

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <MembershipBanner />
      {data && (
        <>
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
        </>
      )}
    </div>
  );
}
