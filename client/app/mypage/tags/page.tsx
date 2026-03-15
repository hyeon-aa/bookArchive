"use client";

import { BubbleTagCloud } from "@/feature/mypage/components/BubbleTagCloud";
import { useGetMyTags } from "@/feature/mypage/queries";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyTagsPage() {
  const router = useRouter();
  const { data, isLoading } = useGetMyTags();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[rgb(var(--primary-sage))]/20 border-t-[rgb(var(--primary-sage))] rounded-full animate-spin" />
      </div>
    );
  }

  const tags = data?.tags || [];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-xl">
      <header className="bg-white px-4 py-3 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">
            내 독서 태그 기록
          </h1>
        </div>
      </header>

      <main className="pb-20">
        <div className="bg-white px-6 pt-12 pb-8 text-center border-b border-gray-50">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[rgb(var(--primary-sage))]/10 rounded-[1.2rem] mb-5">
            <Sparkles size={28} className="text-[rgb(var(--primary-sage))]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">
            내 서재의 색깔
          </h2>
          <p className="text-[15px] text-gray-400 leading-relaxed break-keep font-medium">
            AI가 분석한 기록들을 바탕으로
            <br />
            나만의{" "}
            <span className="text-[rgb(var(--primary-sage))] font-bold">
              독서 키워드 버블
            </span>
            을 만들었어요.
          </p>
        </div>

        <div className="min-h-[300px] flex items-center justify-center">
          {tags.length > 0 ? (
            <BubbleTagCloud tags={tags} />
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-300 font-bold">
                아직 분석된 키워드가 없어요.
              </p>
            </div>
          )}
        </div>

        <div className="px-5 mt-6">
          <div className="bg-[rgb(var(--primary-sage))]/5 rounded-[2.5rem] p-7 border border-[rgb(var(--primary-sage))]/10 transition-all hover:bg-[rgb(var(--primary-sage))]/10">
            <div className="flex items-start gap-3">
              <span className="text-lg">💡</span>
              <p className="text-[14px] text-[rgb(var(--primary-sage))] font-bold leading-relaxed break-keep">
                더 많은 책을 기록하고 AI 피드백을 받을수록
                <br />
                나의 독서 취향 버블이 더욱 풍성하고 정교해져요!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
