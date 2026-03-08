import { Quote, Sparkles } from "lucide-react";
import { DailyQuoteResponse } from "../type";

interface DailyQuoteCardProps {
  quoteData: DailyQuoteResponse | null;
  isLoading: boolean;
}

export function DailyQuoteCard({ quoteData, isLoading }: DailyQuoteCardProps) {
  if (isLoading) {
    return (
      <div className="w-full h-44 bg-[#F2F4F1]/30 animate-pulse rounded-[32px]" />
    );
  }

  if (!quoteData) return null;

  return (
    <div className="group relative w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#EEF2ED] via-[#F3F5F1] to-[#E9EDEA] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D9E2D5] blur-[50px] opacity-50" />

      <Quote
        className="absolute top-5 left-5 text-[#7C9885]/20 w-12 h-12"
        strokeWidth={1.5}
      />

      <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-[#7C9885]/10 border border-[#7C9885]/20 rounded-full px-3 py-1.5">
        <Sparkles size={12} className="text-[#7C9885]" />
        <span className="text-[10px] font-bold text-[#7C9885]">
          오늘의 문장
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center mt-8">
        <p className="text-[17px] font-serif italic text-[#3F3F3F] leading-[1.7] text-center break-keep">
          {quoteData.quote}
        </p>

        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-[12px] text-[#7C9885] font-bold">
            {quoteData.bookTitle}
          </p>
          <p className="text-[11px] text-[#A6BCAF]">{quoteData.author}</p>
        </div>

        <div className="mt-6 w-full py-3 px-4 rounded-2xl bg-white/60 backdrop-blur-md border border-[#7C9885]/10 shadow-sm">
          <p className="text-[12px] text-[#6A7C71] leading-relaxed text-center">
            {quoteData.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
