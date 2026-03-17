"use client";

import { ChevronLeft, MessageSquareQuote } from "lucide-react";
import { useRouter } from "next/navigation";

import { useGetMyPhrases } from "@/feature/mypage/queries";

import { SharePreviewModal } from "@/feature/bookshelf/components/SharePreviewModal";
import { PhraseItem } from "@/feature/mypage/components/PhraseItem";
import { MyPhraseResponse } from "@/feature/mypage/type";
import { useModal } from "@/shared/hooks/useModal";

export default function MyPhrasesPage() {
  const router = useRouter();
  const { open, close } = useModal();
  const { data: phrases, isLoading } = useGetMyPhrases();

  const handleOpenShare = (item: MyPhraseResponse) => {
    open(() => (
      <SharePreviewModal
        phrase={item.phrase}
        title={item.book.title}
        onClose={close}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[rgb(var(--primary-sage))]/20 border-t-[rgb(var(--primary-sage))] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
      <header className="bg-white px-4 py-3 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">기록한 문장들</h1>
          </div>

          <span className="text-[rgb(var(--primary-sage))] font-black text-xs bg-[rgb(var(--primary-sage))]/10 px-3 py-1.5 rounded-full">
            {phrases?.length || 0}
          </span>
        </div>
      </header>

      <main className="p-5 space-y-6 pb-20">
        {!phrases || phrases.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <MessageSquareQuote size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">
              아직 기록된 문장이 없네요.
              <br />책 속 인상깊은 문장을 수집해 보세요!
            </p>
          </div>
        ) : (
          phrases.map((item) => (
            <PhraseItem
              key={item.id}
              bookTitle={item.book.title}
              phrase={item.phrase}
              date={new Date(item.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              onShare={() => handleOpenShare(item)}
            />
          ))
        )}
      </main>
    </div>
  );
}
