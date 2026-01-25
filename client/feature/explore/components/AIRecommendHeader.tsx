// app/airecommend/_components/Header.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function AIRecommendHeader() {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            AI 도서 추천
          </h1>
        </div>
      </div>
    </header>
  );
}
