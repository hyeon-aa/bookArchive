"use client";

import { bookshelfApi } from "@/feature/bookshelf/api";
import { AIMessageSheet } from "@/feature/bookshelf/components/AIMessageSheet";
import type { BookshelfItem, BookStatus } from "@/feature/bookshelf/type";
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
import { useEffect, useState } from "react";

const EMOTIONS = [
  {
    label: "힐링",
    emoji: "🌿",
    color: "bg-[#7C9885]/10 text-[#7C9885] border-[#7C9885]/20",
  },
  {
    label: "열정",
    emoji: "🔥",
    color: "bg-orange-50 text-orange-700 border-orange-100",
  },
  {
    label: "몰입",
    emoji: "🤔",
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label: "감동",
    emoji: "💧",
    color: "bg-purple-50 text-purple-700 border-purple-100",
  },
  {
    label: "짜릿",
    emoji: "⚡",
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  {
    label: "위로",
    emoji: "🫂",
    color: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "궁금",
    emoji: "🧐",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    label: "평온",
    emoji: "😌",
    color: "bg-[#A6BCAF]/20 text-[#7C9885] border-[#A6BCAF]/30",
  },
  {
    label: "슬픔",
    emoji: "😢",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    label: "성장",
    emoji: "🌱",
    color: "bg-[#F5F0E6] text-[#7C9885] border-[#7C9885]/30",
  },
];

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "BEFORE", label: "읽기 전" },
  { value: "READING", label: "읽는 중" },
  { value: "DONE", label: "완독" },
];

export default function BookshelfDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<BookshelfItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<BookStatus>("BEFORE");
  const [comment, setComment] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [aiMessage, setAIMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await bookshelfApi.getBookshelfItem(Number(params.id));
        setItem(data);
        setStatus(data.status);
        setComment(data.comment || "");
        setSelectedEmotion(data.emotion || "");
        setDates({
          start: data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : "",
          end: data.endDate
            ? new Date(data.endDate).toISOString().split("T")[0]
            : "",
        });
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [params.id]);

  const handleSave = async () => {
    if (status === "DONE" && !selectedEmotion) {
      return alert("지금 느끼는 감정을 선택해주세요!");
    }

    setSaving(true);
    try {
      const data = await bookshelfApi.updateBookshelfItem(Number(params.id), {
        status,
        comment: status === "DONE" ? comment : undefined,
        emotion: status === "DONE" ? selectedEmotion : undefined,
        startDate: dates.start,
        endDate: dates.end,
        title: item?.book.title,
      });

      if (data?.aicomment) {
        setAIMessage(data.aicomment);
      } else {
        router.push("/bookshelf");
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F8F9F7]">
        <p className="text-[#A6BCAF] font-bold animate-pulse text-sm uppercase tracking-widest">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="px-5 pt-4 pb-6 space-y-6">
          {item && (
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
          )}

          {item?.aicomment && (
            <section className="relative bg-white rounded-2xl p-5 shadow-sm border-2 border-[#A6BCAF]/20">
              <div className="absolute -top-2 left-4 bg-[#7C9885] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles size={12} />
                AI의 한마디
              </div>
              <div className="pt-2">
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
                  {item.aicomment}
                </p>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#4A4A4A] px-1">
              📖 독서 상태
            </h3>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`flex-1 h-12 rounded-xl border-2 transition-all active:scale-[0.95] font-semibold text-sm ${
                    status === option.value
                      ? "bg-[#7C9885] text-white border-[#7C9885]"
                      : "bg-white text-[#A0A0A0] border-[#E5E7EB] hover:border-[#A6BCAF]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
              <Calendar size={16} className="text-[#7C9885]" />
              시작 날짜
            </label>
            <input
              type="date"
              className="w-full h-12 bg-white rounded-xl px-4 text-sm font-medium border-2 border-[#E5E7EB] outline-none cursor-pointer hover:border-[#A6BCAF] focus:border-[#7C9885] text-[#4A4A4A] transition-colors"
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
                <Calendar size={16} className="text-[#7C9885]" />
                완료 날짜
              </label>
              <input
                type="date"
                className="w-full h-12 bg-white rounded-xl px-4 text-sm font-medium border-2 border-[#E5E7EB] outline-none cursor-pointer hover:border-[#A6BCAF] focus:border-[#7C9885] text-[#4A4A4A] transition-colors"
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
                <Smile size={16} className="text-[#7C9885]" />
                어떤 감정이었나요?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {EMOTIONS.map((emo) => (
                  <button
                    key={emo.label}
                    type="button"
                    onClick={() => setSelectedEmotion(emo.label)}
                    className={`relative flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all active:scale-[0.95] ${
                      selectedEmotion === emo.label
                        ? `${emo.color} border-[#7C9885] font-bold`
                        : "bg-white text-[#A0A0A0] border-[#E5E7EB] hover:border-[#A6BCAF]"
                    }`}
                  >
                    <span className="text-base">{emo.emoji}</span>
                    <span className="text-sm">{emo.label}</span>
                    {selectedEmotion === emo.label && (
                      <Check
                        size={16}
                        strokeWidth={3}
                        className="absolute right-2 text-[#7C9885]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#4A4A4A] px-1 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#7C9885]" />
                한줄평
              </h3>
              <textarea
                className="w-full p-4 bg-white rounded-xl min-h-[120px] text-[#4A4A4A] border-2 border-[#E5E7EB] outline-none hover:border-[#A6BCAF] focus:border-[#7C9885] placeholder:text-[#A6BCAF] text-sm leading-relaxed resize-none transition-colors"
                placeholder="마음을 울린 구절이나 생각을 담아보세요."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </section>
          </div>

          <div className="pt-2 pb-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 bg-[#7C9885] active:bg-[#6B8573] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#7C9885]/25 transition-all disabled:bg-[#A6BCAF] disabled:shadow-none"
            >
              {saving ? (
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
      </div>
    </div>
  );
}
