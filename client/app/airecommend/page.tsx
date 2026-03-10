"use client";

import { useRecommendByEmotion } from "@/feature/explore/queries";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOOD_DATA } from "../../shared/constants/mood";

export default function AIRecommendPage() {
  const [activeTab, setActiveTab] = useState(MOOD_DATA[0].id);
  const [todayMood, setTodayMood] = useState("");
  const [wantMood, setWantMood] = useState("");
  const { mutate: recommend, isPending } = useRecommendByEmotion();

  const router = useRouter();

  const handleRecommend = () => {
    if (!todayMood || !wantMood) return;

    recommend(
      { mood: todayMood, talk: wantMood },
      {
        onSuccess: (response) => {
          if (response) {
            router.push(
              `/airecommend/result?data=${encodeURIComponent(
                JSON.stringify(response)
              )}`
            );
          }
        },
        onError: (error) => {
          console.error("추천 실패:", error);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto bg-white min-h-screen px-5 pb-10">
        <section className="space-y-8">
          <div className="space-y-4 pt-8">
            <h1 className="text-2xl font-bold text-[#3F3F3F] leading-snug">
              지금 당신에게 어울리는 책을
              <br />
              AI가 추천해드릴게요
            </h1>
          </div>

          <div className="space-y-5">
            <label className="text-sm font-bold text-[#5A5A5A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7C9885] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              오늘 어떤 기분이신가요?
            </label>

            <div className="flex border-b border-[#E3E8E0]">
              {MOOD_DATA.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex-1 pb-2 text-sm transition-all ${
                    activeTab === cat.id
                      ? "text-[#7C9885] font-bold border-b-2 border-[#7C9885]"
                      : "text-[#9CA3AF] border-b-2 border-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
              {MOOD_DATA.find((cat) => cat.id === activeTab)?.moods.map(
                (mood) => (
                  <button
                    key={mood}
                    onClick={() => setTodayMood(mood)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      todayMood === mood
                        ? "bg-[#7C9885] border-[#7C9885] text-white"
                        : "bg-[#F3F5F1] border-transparent text-[#7C857E] hover:border-[#7C9885]"
                    }`}
                  >
                    {mood}
                  </button>
                )
              )}
            </div>
          </div>

          {!isPending && (
            <div className="space-y-4 pt-2">
              <label className="text-sm font-bold text-[#5A5A5A] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C9885] text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                요즘 어떤 상황이나 고민이 있으신가요?
              </label>
              <div className="space-y-3">
                <textarea
                  value={wantMood}
                  onChange={(e) => setWantMood(e.target.value)}
                  placeholder="예: 회사 업무로 번아웃이 온 것 같아요, 위로가 되는 따뜻한 이야기를 읽고 싶어요"
                  rows={4}
                  className="w-full rounded-xl border border-[#E3E8E0] px-4 py-3
                    text-sm focus:outline-none focus:border-[#7C9885] resize-none leading-relaxed"
                />

                <button
                  onClick={handleRecommend}
                  disabled={!todayMood || !wantMood}
                  className="w-full mt-2 flex items-center justify-center gap-2
                    rounded-xl py-4 text-base font-bold transition-all
                    disabled:bg-[#E9ECE9] disabled:text-[#9CA3AF]
                    bg-[#7C9885] text-white active:scale-[0.98]"
                >
                  <BookOpen size={18} />
                  나를 위한 책 추천받기
                </button>
              </div>
            </div>
          )}

          {isPending && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C9885]"></div>
              <p className="text-[#7C9885] font-medium text-sm">
                AI가 추천할 책을 고르고 있어요...
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
