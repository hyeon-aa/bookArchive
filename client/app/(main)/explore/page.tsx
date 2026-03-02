"use client";

import { exploreApi } from "@/feature/explore/api";
import { AIRecommendButton } from "@/feature/explore/components/AIRecommendButton";
import { DailyQuoteCard } from "@/feature/explore/components/DailyQuoteCard";
import { TasteRecommendation } from "@/feature/explore/components/TasteRecommendation";
import { DailyQuote, TasteRecommend } from "@/feature/explore/type";
import { useEffect, useState } from "react";

export default function ExplorePage() {
  const [quoteData, setQuoteData] = useState<DailyQuote | null>(null);
  const [tasteData, setTasteData] = useState<TasteRecommend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const [quote, taste] = await Promise.all([
          exploreApi.getDailyQuote(),
          exploreApi.getTasteRecommendations(),
        ]);
        setQuoteData(quote);
        setTasteData(taste);
      } catch (error) {
        console.error("error", error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

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
