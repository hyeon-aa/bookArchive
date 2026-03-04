"use client";

import { BOOK_STATUS, STATUS_STYLE } from "@/app/constants/book_status";
import { EMOTIONS } from "@/app/constants/emotion";
import { AIMessageSheet } from "@/feature/bookshelf/components/AIMessageSheet";
import { useBookshelfItem, useUpdateBook } from "@/feature/bookshelf/queries";
import {
  BookshelfItem,
  BookStatus,
  UpdateBookshelfRequest,
} from "@/feature/bookshelf/type";
import {
  Calendar,
  Check,
  Loader2,
  MessageSquare,
  Smile,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function BookshelfEditForm({ item }: { item: BookshelfItem }) {
  const router = useRouter();
  const { mutate: updateBook, isPending: isSaving } = useUpdateBook(item.id);

  const [status, setStatus] = useState<BookStatus>(item.status);
  const [comment, setComment] = useState(item.comment || "");
  const [selectedEmotion, setSelectedEmotion] = useState(item.emotion || "");
  const [dates, setDates] = useState({
    start: item.startDate
      ? new Date(item.startDate).toISOString().split("T")[0]
      : "",
    end: item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
  });
  const [aiMessage, setAIMessage] = useState<string | null>(null);

  const handleSave = () => {
    if (status === "DONE" && !selectedEmotion) {
      return alert("지금 느끼는 감정을 선택해주세요!");
    }

    const payload: UpdateBookshelfRequest = {
      status,
      comment: status === "DONE" ? comment : undefined,
      emotion: status === "DONE" ? selectedEmotion : undefined,
      startDate: dates.start,
      endDate: dates.end,
      title: item.book.title,
    };

    updateBook(payload, {
      onSuccess: (data) => {
        if (data?.aiComment) {
          setAIMessage(data.aiComment);
        } else {
          router.push("/bookshelf");
        }
      },
      onError: (error) => {
        alert(
          error instanceof Error
            ? error.message
            : "저장 중 오류가 발생했습니다."
        );
      },
    });
  };

  return (
    <div className="px-5 pt-4 pb-6 space-y-6">
      {/* 도서 정보 카드 */}
      <section className="relative bg-gradient-to-br from-[#F5F0E6] to-[#E8E4DA] rounded-3xl p-6 overflow-hidden border border-[#7C9885]/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C9885]/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative flex items-start gap-4">
          <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border-2 border-white">
            <Image
              src={item.book.imageUrl}
              alt={item.book.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="font-bold text-[#4A4A4A] text-base leading-tight line-clamp-2 mb-1.5">
              {item.book.title}
            </h2>
            <p className="text-xs text-[#7C9885] font-medium">
              {item.book.author}
            </p>
          </div>
        </div>
      </section>

      {/* AI의 한마디 (기존 데이터가 있을 때) */}
      {item.aiComment && (
        <section className="relative bg-white rounded-2xl p-5 shadow-sm border-2 border-[#A6BCAF]/20">
          <div className="absolute -top-2 left-4 bg-[#7C9885] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Sparkles size={12} /> AI의 한마디
          </div>
          <div className="pt-2">
            <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
              {item.aiComment}
            </p>
          </div>
        </section>
      )}

      {/* 독서 상태 선택 */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-[#4A4A4A] px-1">📖 독서 상태</h3>
        <div className="flex gap-2">
          {BOOK_STATUS.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatus(option.value)}
              className={`flex-1 h-12 rounded-xl border-2 transition-all font-semibold text-sm flex items-center justify-center gap-1.5 ${
                status === option.value
                  ? STATUS_STYLE[option.value]
                  : "bg-white text-[#A0A0A0] border-[#E5E7EB]"
              }`}
            >
              {status === option.value && <span>{option.emoji}</span>}
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <label className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
          <Calendar size={16} className="text-[#7C9885]" /> 시작 날짜
        </label>
        <input
          type="date"
          className="w-full h-12 bg-white rounded-xl px-4 text-sm border-2 border-[#E5E7EB] outline-none"
          value={dates.start}
          onChange={(e) => setDates({ ...dates, start: e.target.value })}
        />
      </section>

      <div
        className={`space-y-6 transition-all duration-500 ease-out ${
          status === "DONE"
            ? "opacity-100 max-h-[2000px]"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        <section className="space-y-3">
          <label className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
            <Calendar size={16} className="text-[#7C9885]" /> 완료 날짜
          </label>
          <input
            type="date"
            className="w-full h-12 bg-white rounded-xl px-4 text-sm border-2 border-[#E5E7EB] outline-none"
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
            <Smile size={16} className="text-[#7C9885]" /> 어떤 감정이었나요?
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.label}
                type="button"
                onClick={() => setSelectedEmotion(emo.label)}
                className={`relative flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all ${
                  selectedEmotion === emo.label
                    ? `${emo.color} border-[#7C9885] font-bold`
                    : "bg-white text-[#A0A0A0] border-[#E5E7EB]"
                }`}
              >
                <span className="text-base">{emo.emoji}</span>
                <span className="text-sm">{emo.label}</span>
                {selectedEmotion === emo.label && (
                  <Check size={16} className="absolute right-2" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
            <MessageSquare size={16} className="text-[#7C9885]" /> 한줄평
          </h3>
          <textarea
            className="w-full p-4 bg-white rounded-xl min-h-[120px] text-sm border-2 border-[#E5E7EB] outline-none"
            placeholder="마음을 울린 구절이나 생각을 담아보세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </section>
      </div>

      {/* 저장 버튼 */}
      <div className="pt-2 pb-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-14 bg-[#7C9885] text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:bg-[#A6BCAF]"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm">AI가 분석중...</span>
            </>
          ) : (
            "기록 남기기"
          )}
        </button>
      </div>

      <AIMessageSheet
        open={!!aiMessage}
        message={aiMessage ?? ""}
        onClose={() => {
          setAIMessage(null);
          router.push("/bookshelf");
        }}
      />
    </div>
  );
}

/**
 * 2. 메인 페이지 컴포넌트 (부모)
 * 데이터 로딩만 담당하며, 로딩이 끝나면 EditForm을 마운트합니다.
 */
export default function BookshelfDetailPage() {
  const params = useParams();
  const bookId = Number(params.id);
  const { data: item, isLoading } = useBookshelfItem(bookId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F8F9F7]">
        <p className="text-[#A6BCAF] font-bold animate-pulse text-sm tracking-widest uppercase">
          Loading...
        </p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* key={item.id}가 핵심입니다. 데이터가 바뀌면 컴포넌트를 새로 그립니다. */}
        <BookshelfEditForm key={item.id} item={item} />
      </div>
    </div>
  );
}
