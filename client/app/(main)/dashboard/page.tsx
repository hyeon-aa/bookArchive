"use client";

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
  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400 font-medium">
        데이터를 분석 중입니다...
      </div>
    );

  return (
    <div className="max-w-md mx-auto px-5 py-10 space-y-10 bg-[#FBFBFB] min-h-screen pb-20">
      {data && (
        <>
          <header className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              독서 인사이트
            </h1>
            <p className="text-sm font-medium text-gray-400">
              한눈에 확인하는 나의 독서 리포트
            </p>
          </header>

          <ReadingOverView
            totalCount={data.totalCount}
            doneCount={data.doneCount}
            readingCount={data.readingCount}
            completionRate={data.completionRate}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-lg">📊</span>
              <h3 className="font-bold text-gray-800">월별 독서 흐름</h3>
            </div>
            <MonthlyChart data={data.monthlyStats} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-lg">🎨</span>
              <h3 className="font-bold text-gray-800">마음의 색깔</h3>
            </div>
            <EmotionSummary emotionStats={data.emotionStats} />
          </div>
        </>
      )}
    </div>
  );
}
