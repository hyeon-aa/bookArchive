export const EMOTIONS = [
  {
    label: "힐링",
    emoji: "🌿",
    color: "bg-[#7C9885]/10 text-[#7C9885] border-[#7C9885]/20",
  },
  {
    label: "동기부여",
    emoji: "🚀",
    color: "bg-orange-50 text-orange-700 border-orange-100",
  },
  {
    label: "몰입",
    emoji: "📖",
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label: "감동",
    emoji: "💧",
    color: "bg-purple-50 text-purple-700 border-purple-100",
  },
  {
    label: "짜릿",
    emoji: "🔥",
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  {
    label: "위로",
    emoji: "✨",
    color: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "희망",
    emoji: "🌟",
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  {
    label: "공감",
    emoji: "💗",
    color: "bg-rose-50 text-rose-700 border-rose-100",
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
  {
    label: "여운",
    emoji: "🌙",
    color: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    label: "유익",
    emoji: "💡",
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
] as const;

export const EMOTION_EMOJIS: Record<string, string> = EMOTIONS.reduce(
  (acc, cur) => ({ ...acc, [cur.label]: cur.emoji }),
  {}
);
