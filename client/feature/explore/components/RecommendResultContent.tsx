"use client";

import { bookshelfApi } from "@/feature/bookshelf/api";
import { BookStatus } from "@/feature/bookshelf/type";
import { useRecommendByEmotion } from "@/feature/explore/queries";
import { RecommendBookItemResponse } from "@/feature/explore/type";
import { useRecommendStore } from "@/shared/store/useRecommendStore";
import { ArrowLeft, BookOpen, Info, Plus, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RecommendByEmotionResultContent() {
  const router = useRouter();
  const { result, payload, setResult } = useRecommendStore();
  const { mutate: recommend, isPending } = useRecommendByEmotion();

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9F7] px-5 text-center">
        <p className="text-[#9CA3AF] mb-4">추천 목록을 불러올 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="text-[#7C9885] font-bold flex items-center gap-2"
        >
          <ArrowLeft size={18} /> 이전으로 돌아가기
        </button>
      </div>
    );
  }

  const handleAddToLibrary = async (book: RecommendBookItemResponse) => {
    try {
      await bookshelfApi.addBook({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        description: book.description,
        status: "BEFORE" as BookStatus,
      });
      alert(`${book.title}이(가) 내 책장에 담겼습니다.`);
    } catch (e) {
      console.error(e);
      alert("책장 등록에 실패했어요.");
    }
  };

  const handleRetry = () => {
    if (!payload) return;

    recommend(payload, {
      onSuccess: (response) => {
        if (response) {
          setResult(response);
        }
      },
      onError: (error) => {
        console.error("추천 실패:", error);
      },
    });
  };

  return (
    <main className="min-h-screen px-5 pb-20 bg-white">
      <section className="pt-5 pb-6 relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-32 bg-[#A6BCAF]/10 blur-[50px]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="max-w-[320px] relative bg-gradient-to-br from-[#F9FAFB] to-white border border-[#F3F4F6] rounded-2xl px-5 py-4 shadow-sm">
            <BookOpen
              className="absolute -top-2 -left-2 text-[#7C9885]/20 w-8 h-8"
              strokeWidth={1.5}
            />
            <p className="text-[15px] leading-[1.7] text-[#4B5563] break-keep font-medium relative z-10">
              {result.reason}
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-[#7C9885]/5 rounded-xl border border-[#7C9885]/10">
        <Info size={14} className="text-[#7C9885] flex-shrink-0" />
        <p className="text-[11px] text-[#6B7280]">
          이 추천은 일회성이에요. 마음에 들면{" "}
          <span className="font-semibold text-[#7C9885]">서재 담기</span>를
          눌러보세요.
        </p>
      </div>

      <section className="mt-12 space-y-8">
        <div className="flex items-center gap-3">
          <h2 className="text-[11px] font-bold text-[#7C9885] uppercase tracking-[0.2em] whitespace-nowrap">
            Recommended
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-[#7C9885]/30 to-transparent" />
        </div>
        <div className="grid gap-8">
          {result.books.map((book) => (
            <div
              key={book.isbn}
              className="bg-white border border-[#F3F4F6] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex gap-5">
                <div className="relative w-[120px] h-[170px] flex-shrink-0">
                  <div className="w-full h-full rounded-lg overflow-hidden border border-black/5 shadow-md">
                    <Image
                      src={book.imageUrl || "/placeholder-book.png"}
                      alt={book.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#1F2937] text-[16px] line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-[13px] text-[#9CA3AF]">{book.author}</p>
                  </div>
                  <button
                    onClick={() => handleAddToLibrary(book)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#F1F5F2] text-[#7C9885] text-[13px] font-bold border border-[#7C9885]/10 hover:bg-[#7C9885] hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    <Plus size={15} /> 내 책장에 담기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white border border-[#F3F4F6] text-[#9CA3AF] text-[13px] font-medium transition-all hover:bg-[#F9FAFB]"
        >
          <RefreshCcw size={15} />{" "}
          {isPending ? "AI가 다시 추천 중이에요..." : "다시 추천받기"}
        </button>
      </div>
    </main>
  );
}
