"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

import { EmotionSummary } from "@/feature/dashboard/components/EmotionSummary";
import { MonthlyChart } from "@/feature/dashboard/components/MonthlyChart";
import { ReadingOverView } from "@/feature/dashboard/components/ReadingOverView";
import { DashboardData } from "@/feature/dashboard/type";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await apiFetch("/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setData(res);
    };

    fetchDashboard();
  }, []);

  if (!data) return <div className="p-10">불러오는 중...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <ReadingOverView
        totalCount={data.totalCount}
        doneCount={data.doneCount}
        readingCount={data.readingCount}
        completionRate={data.completionRate}
      />

      <MonthlyChart data={data.monthlyStats} />

      <EmotionSummary emotionStats={data.emotionStats} />
    </div>
  );
}
