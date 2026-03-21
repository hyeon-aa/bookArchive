import { AiReportResponse } from "@/feature/explore/type";
import {
  BarChart3,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  UserRound,
} from "lucide-react";

export const AiReportCard = ({ data }: { data: AiReportResponse }) => {
  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[#7C9885]">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            AI Insight Report
          </span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          {data.reportTitle}
        </h2>
      </div>

      <div className="bg-[#7C9885]/5 p-6 rounded-2xl border border-[#7C9885]/10 space-y-4">
        <div className="flex gap-5 items-start">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{data.character.name}</h3>
              <span className="text-[10px] font-semibold text-[#7C9885] bg-white px-2 py-0.5 rounded-full border border-[#7C9885]/20">
                CHARACTER
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {data.character.description}
            </p>
          </div>
        </div>

        <div className="bg-white/50 p-3 rounded-xl text-[13px] text-gray-600 leading-relaxed">
          <span className="font-bold text-[#7C9885] mr-1">Why?</span>{" "}
          {data.character.reason}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {data.character.traits.map((trait) => (
            <span
              key={trait}
              className="text-[11px] font-medium bg-white border border-gray-100 px-3 py-1 rounded-full text-gray-500 shadow-sm"
            >
              #{trait}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#7C9885]/10 text-[#7C9885]">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-gray-900 text-base tracking-tight">
            독서 분석 리포트
          </h4>
        </div>

        <div className="ml-3 pl-6 border-l-2 border-gray-100 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#7C9885] font-bold text-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>핵심 의도: {data.topIntent.label}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {data.topIntent.insight}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-800 underline decoration-[#7C9885]/30 underline-offset-4">
              {data.intentVsEmotionAnalysis.summary}
            </p>
            <ul className="space-y-1.5">
              {data.intentVsEmotionAnalysis.details.map((detail, i) => (
                <li
                  key={i}
                  className="text-[13px] text-gray-500 flex items-start gap-2"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#7C9885] shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase">
              Main Emotion
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {data.statistics.mostFrequentEmotion}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
          <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase">
            Summary
          </p>
          <p className="text-[12px] text-gray-600 leading-tight font-medium">
            {data.statistics.changeSummary}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <div className="bg-[#7C9885] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-5 -bottom-5 text-white opacity-10 text-9xl select-none leading-none">
            🌿
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/20 text-white">
                <UserRound className="w-4 h-4" />
              </div>
              <p className="text-[12px] opacity-90 font-bold uppercase tracking-wider">
                AI READING COACH
              </p>
            </div>
            <p className="text-[15px] font-medium leading-relaxed">
              {data.coachMessage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
