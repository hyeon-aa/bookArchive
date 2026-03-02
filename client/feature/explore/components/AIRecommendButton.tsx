"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function AIRecommendButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/airecommend")}
      className="group w-full text-left rounded-3xl border
        border-[#E3E8E0] bg-white
        px-5 py-5 transition-all
        hover:border-[#7C9885]/40
        hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#7C9885]">
        <Sparkles size={14} />
        AI 도서 추천
      </div>

      <p className="text-[15px] font-bold text-[#3F3F3F] mb-2">
        오늘의 감정으로 책을 추천받아보세요
      </p>

      <div className="flex items-center justify-between text-xs text-[#A6BCAF]">
        <span className="flex items-center gap-1.5">
          <BookOpen size={14} />
          감정 입력 후 추천
        </span>
        <span className="font-semibold text-[#7C9885] group-hover:translate-x-0.5 transition-transform">
          시작하기 →
        </span>
      </div>
    </button>
  );
}
