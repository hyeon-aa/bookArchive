"use client";

import { DashboardSection } from "@/feature/dashboard/components/DashboardSection";
import { EmotionSummary } from "@/feature/dashboard/components/EmotionSummary";
import { MonthlyChart } from "@/feature/dashboard/components/MonthlyChart";
import { ReadingOverView } from "@/feature/dashboard/components/ReadingOverView";
import { useDashboardStats } from "@/feature/dashboard/queries";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  if (error)
    return (
      <div className="p-10 text-center text-red-500">데이터 로드 실패</div>
    );

  if (isLoading) {
    return <div className="p-10 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {data && (
        <>
          <DashboardSection title="나의 독서 여정" emoji="📚">
            <ReadingOverView
              totalCount={data.totalCount}
              doneCount={data.doneCount}
              readingCount={data.readingCount}
              completionRate={data.completionRate}
            />
          </DashboardSection>

          <DashboardSection title="월별 독서 통계" emoji="📊">
            <MonthlyChart data={data.monthlyStats} />
          </DashboardSection>

          <DashboardSection title="감정 분포" emoji="💬">
            <EmotionSummary emotionStats={data.emotionStats} />
          </DashboardSection>
        </>
      )}
    </div>
  );
}
