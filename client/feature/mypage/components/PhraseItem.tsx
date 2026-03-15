"use client";

import { Share2 } from "lucide-react";

interface PhraseItemProps {
  bookTitle: string;
  phrase: string;
  date: string;
  onShare: () => void;
}

export function PhraseItem({
  bookTitle,
  phrase,
  date,
  onShare,
}: PhraseItemProps) {
  return (
    <div className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[rgb(var(--primary-sage))]/5 rounded-bl-full -z-10 transition-opacity group-hover:opacity-10" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-[rgb(var(--primary-sage))] uppercase tracking-widest bg-[rgb(var(--primary-sage))]/10 px-2.5 py-1 rounded-lg w-fit">
            {bookTitle}
          </span>
          <span className="text-[10px] text-gray-300 font-medium ml-0.5">
            {date}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-[rgb(var(--primary-sage))] hover:text-white transition-all active:scale-90"
          title="공유 카드 만들기"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className="relative">
        <p className="text-gray-800 text-base leading-relaxed break-keep">
          {phrase}
        </p>
      </div>

      <div className="mt-5 w-6 h-1 bg-[rgb(var(--primary-sage))]/20 rounded-full" />
    </div>
  );
}
