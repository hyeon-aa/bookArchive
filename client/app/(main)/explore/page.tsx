"use client";

import { AIRecommendButton } from "@/feature/explore/components/AIRecommendButton";
import { DailyQuoteCard } from "@/feature/explore/components/DailyQuoteCard";
import { TasteRecommendation } from "@/feature/explore/components/TasteRecommendation";
import {
  useDailyQuote,
  useTasteRecommendations,
} from "@/feature/explore/queries";

export default function ExplorePage() {
  const { data: quoteData, isLoading: isQuoteLoading } = useDailyQuote();
  const { data: tasteData, isLoading: isTasteLoading } =
    useTasteRecommendations();

  const isLoading = isQuoteLoading || isTasteLoading;

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto bg-white min-h-screen px-5 pt-6 pb-20">
        <AIRecommendButton />

        {/* 오늘의 한 문장 섹션 */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[13px] font-bold text-[#7C9885] tracking-tight">
              오늘의 한 문장
            </h2>
            <span className="text-[10px] text-[#A6BCAF] font-medium">
              Daily Pick
            </span>
          </div>
          <DailyQuoteCard quoteData={quoteData} isLoading={isLoading} />
        </div>

        {/* 취향 기반 도서 추천 섹션 */}
        <TasteRecommendation data={tasteData} isLoading={isLoading} />
      </div>
    </div>
  );
}
