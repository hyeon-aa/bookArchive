"use client";

import { exploreApi } from "@/feature/explore/api";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// 카테고리별 무드 데이터
const MOOD_DATA = [
  {
    id: "rest",
    label: "휴식/안정",
    moods: [
      "지친",
      "무기력한",
      "잔잔한",
      "나른한",
      "편안한",
      "쉬어가고 싶은",
      "차분해지고 싶은",
    ],
  },
  {
    id: "blue",
    label: "불안/슬픔",
    moods: ["심란한", "막막한", "예민한", "외로운", "공허한"],
  },
  {
    id: "energy",
    label: "활기/기쁨",
    moods: ["설레는", "궁금한", "자신감 있는", "즐거운", "벅찬", "의욕적인"],
  },
  {
    id: "mood",
    label: "감성/추억",
    moods: ["몽글몽글한", "아련한", "뭉클한", "센치한", "그리운"],
  },
  {
    id: "drive",
    label: "변화/동기",
    moods: [
      "다시 시작하고 싶은",
      "자극이 필요한",
      "동기부여가 필요한",
      "변화가 필요한",
    ],
  },
];

export default function AIRecommendPage() {
  const [activeTab, setActiveTab] = useState(MOOD_DATA[0].id);
  const [todayMood, setTodayMood] = useState("");
  const [wantMood, setWantMood] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRecommend = async () => {
    if (!todayMood || !wantMood) return;

    setLoading(true);
    try {
      const response = await exploreApi.recommendByEmotion(todayMood, wantMood);

      if (response) {
        console.log("추천 결과:", response);
        router.push(
          `/airecommend/result?data=${encodeURIComponent(
            JSON.stringify(response)
          )}`
        );
      }
    } catch (error) {
      console.error("추천 실패:", error);
      alert("AI 추천을 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
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

          {!loading && (
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

          {loading && (
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
