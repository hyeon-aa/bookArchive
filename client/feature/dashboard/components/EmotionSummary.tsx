"use client";

import { EMOTIONS } from "@/shared/constants/emotion";

type EmotionStat = {
  emotion: string;
  count: number;
};

interface EmotionSummaryProps {
  emotionStats: EmotionStat[];
}

export function EmotionSummary({ emotionStats }: EmotionSummaryProps) {
  if (!emotionStats || emotionStats.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-gray-400">아직 기록된 감정이 없어요.</p>
      </div>
    );
  }

  const total = emotionStats.reduce((sum, e) => sum + e.count, 0);
  const topEmotion = emotionStats[0];

  const topemotionType = EMOTIONS.find(
    (emotion) => emotion.label === topEmotion.emotion
  );
  const emotionEmoji = topemotionType?.emoji;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 py-2">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#7C9885]/10 flex items-center justify-center text-3xl">
          {emotionEmoji}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-400">
            가장 많이 느낀 감정
          </h4>
          <p className="text-xl font-bold text-gray-900">
            {topEmotion.emotion}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {emotionStats.slice(0, 3).map((stat, index) => {
          const percent = Math.round((stat.count / total) * 100);
          return (
            <div key={stat.emotion} className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {stat.emotion}
                </span>
                <span className="text-xs font-bold text-[#7C9885]">
                  {percent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C9885] rounded-full"
                  style={{ width: `${percent}%`, opacity: 1 - index * 0.3 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
