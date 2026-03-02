"use client";

type EmotionStat = {
  emotion: string;
  count: number;
};

interface Props {
  emotionStats: EmotionStat[];
}

export function EmotionSummary({ emotionStats }: Props) {
  if (!emotionStats || emotionStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-1">💬 감정의 기록</p>
        <p className="text-xs text-gray-500">아직 남긴 감정이 없어요.</p>
      </div>
    );
  }

  const topEmotion = emotionStats[0];
  const total = emotionStats.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
      <div>
        <p className="text-xs text-gray-500">💬 가장 많이 남긴 감정</p>

        <div className="mt-1 text-xl font-semibold text-[#7C9885]">
          {topEmotion.emotion}
          <span className="ml-2 text-sm text-gray-400">
            {topEmotion.count}회
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {emotionStats.map((emotion) => {
          const percent = Math.round((emotion.count / total) * 100);

          return (
            <div key={emotion.emotion}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{emotion.emotion}</span>
                <span>{percent}%</span>
              </div>

              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-[#A6BCAF] rounded-full"
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
