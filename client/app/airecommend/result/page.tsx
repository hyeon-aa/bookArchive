"use client";

import RecommendByEmotionResultContent from "@/feature/explore/components/RecommendResultContent";
import { Suspense } from "react";

export default function RecommendResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-[#9CA3AF]">
          추천 결과를 불러오는 중입니다...
        </div>
      }
    >
      <RecommendByEmotionResultContent />
    </Suspense>
  );
}
