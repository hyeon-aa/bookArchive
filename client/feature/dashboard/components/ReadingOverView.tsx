interface Props {
  totalCount: number;
  doneCount: number;
  readingCount: number;
  completionRate: number;
}

export function ReadingOverView({
  totalCount,
  doneCount,
  readingCount,
  completionRate,
}: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#7C9885]/10 to-[#A6BCAF]/15 p-6 border border-[#A6BCAF]/30">
      <p className="text-xs text-gray-500">📚 나의 독서 여정</p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-gray-900">
          {totalCount}
        </span>
        <span className="text-sm text-gray-500">권의 기록</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
        <div className="px-3 py-1.5 rounded-full bg-white/70">
          완독 {doneCount}
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/70">
          읽는 중 {readingCount}
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>완독률</span>
          <span>{completionRate}%</span>
        </div>

        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-2 bg-[#7C9885] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
