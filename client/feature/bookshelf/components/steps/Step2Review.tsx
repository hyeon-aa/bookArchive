import { UpdateBookshelfRequest } from "@/feature/bookshelf/type";
import { EMOTIONS } from "@/shared/constants/emotion";
import { Check, MessageSquare } from "lucide-react";
import { FunnelStepLayout } from "./FunnelStepLayout";

interface Step2Props {
  emotion: string;
  comment: string;
  onChange: (fields: Partial<UpdateBookshelfRequest>) => void;
}

export function Step2Review({ emotion, comment, onChange }: Step2Props) {
  return (
    <FunnelStepLayout
      title="어떤 기분이 드시나요?"
      description="책을 덮으며 느꼈던 마음을 남겨주세요."
    >
      <div className="grid grid-cols-3 gap-2">
        {EMOTIONS.map((emo) => (
          <button
            key={emo.label}
            type="button"
            onClick={() => onChange({ emotion: emo.label })}
            className={`relative py-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
              emotion === emo.label
                ? `${emo.color} border-transparent`
                : "border-[#F3F4F6] text-[#A0A0A0] bg-white"
            }`}
          >
            <span className="text-xl">{emo.emoji}</span>
            <span className="text-[11px] font-bold">{emo.label}</span>
            {emotion === emo.label && (
              <div className="absolute -top-1 -right-1 bg-current rounded-full p-0.5 shadow-sm">
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-6">
        <label className="text-xs font-bold text-[#7C9885] flex items-center gap-2 px-1 uppercase tracking-wider">
          <MessageSquare size={14} /> 한줄평
        </label>
        <textarea
          value={comment}
          onChange={(e) => onChange({ comment: e.target.value })}
          placeholder="책을 읽고 난 후의 감상평을 적어보세요."
          className="w-full p-4 bg-[#F9FAFB] rounded-2xl min-h-[160px] text-sm outline-none focus:ring-2 ring-[#7C9885]/20 resize-none border-none placeholder:text-gray-300"
        />
      </div>
    </FunnelStepLayout>
  );
}
