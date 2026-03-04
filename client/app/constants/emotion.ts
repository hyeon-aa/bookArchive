export const EMOTIONS = [
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
] as const;

export const EMOTION_EMOJIS: Record<string, string> = EMOTIONS.reduce(
  (acc, cur) => ({ ...acc, [cur.label]: cur.emoji }),
  {}
);
