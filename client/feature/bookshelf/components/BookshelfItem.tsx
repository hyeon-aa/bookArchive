"use client";

import { EMOTION_EMOJIS } from "@/app/constants/emotion";
import Image from "next/image";
import type { BookshelfItemResponse } from "../type";
import { BookStatusBadge } from "./BookStatusBadge";

export function BookshelfItem({ item }: { item: BookshelfItemResponse }) {
  const getEmotionEmoji = (emotion: string | null) => {
    if (!emotion) return null;
    return EMOTION_EMOJIS[emotion] || "✨";
  };

  return (
    <div className="flex gap-5 p-5 bg-white rounded-[2rem] shadow-sm border border-[#F5F0E6] transition-all active:scale-[0.98] hover:shadow-md relative overflow-hidden">
      <div className="relative w-25 h-35 flex-shrink-0 shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <Image
          src={item.book.imageUrl}
          alt={item.book.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#4A4A4A] text-[15px] line-clamp-1 tracking-tight">
              {item.book.title}
            </h3>
            <p className="text-xs text-[#A6BCAF] mt-0.5 line-clamp-1 font-medium">
              {item.book.author}
            </p>
          </div>

          {item.emotion && (
            <span className="text-lg leading-none" title={item.emotion}>
              {getEmotionEmoji(item.emotion)}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <BookStatusBadge status={item.status} />
            {item.startDate && (
              <span className="text-[10px] text-[#A6BCAF] font-medium">
                {new Date(item.startDate).toLocaleDateString()}
                {item.status === "DONE" && item.endDate && (
                  <span className="ml-0.5">
                    ~ {new Date(item.endDate).toLocaleDateString()}
                  </span>
                )}
                {item.status !== "DONE" && "~"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-3">
          {item.aiTags && item.aiTags.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-[#A6BCAF] tracking-wide uppercase">
                  ✨ AI 분석 태그
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.aiTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2.5 py-1 bg-[#F5F0E6] text-[#7C9885] rounded-md border border-[#A6BCAF]/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : item.comment ? (
            <div className="flex items-center gap-1.5 text-[10px] text-[#A6BCAF] font-bold">
              <div className="w-1 h-1 bg-[#A6BCAF] rounded-full animate-ping" />
              AI가 분석중이에요...
            </div>
          ) : (
            <span className="text-[10px] text-[#E5E7EB] font-bold px-2 py-0.5 bg-gray-50 rounded-full">
              #감상기록전
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
