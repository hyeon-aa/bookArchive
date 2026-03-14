"use client";

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

  return (
    <div className="space-y-6">
      <div className="bg-[#F8FAF9] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#7C9885] uppercase tracking-wider mb-1">
            가장 많이 느낀 감정
          </p>
          <h4 className="text-lg font-bold text-gray-800">
            {topEmotion.emotion} <span className="text-[#7C9885]"></span>
          </h4>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[#7C9885]/20">
            {Math.round((topEmotion.count / total) * 100)}%
          </span>
        </div>
      </div>

      <div className="px-1 space-y-4">
        {emotionStats.map((stat, index) => {
          const percent = Math.round((stat.count / total) * 100);
          const barColor = index === 0 ? "bg-[#7C9885]" : "bg-[#7C9885]/30";
          const textColor =
            index === 0 ? "font-bold text-gray-800" : "text-gray-500";

          return (
            <div key={stat.emotion} className="group">
              <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${textColor}`}>{stat.emotion}</span>
                  <span className="text-[10px] text-gray-300">
                    {stat.count}회
                  </span>
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    index === 0 ? "text-[#7C9885]" : "text-gray-400"
                  }`}
                >
                  {percent}%
                </span>
              </div>

              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
