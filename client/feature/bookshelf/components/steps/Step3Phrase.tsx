import { Quote, Share2 } from "lucide-react";
import { UpdateBookshelfRequest } from "../../type";
import { FunnelStepLayout } from "./FunnelStepLayout";

interface Step3Props {
  phrase: string;
  onChange: (fields: Partial<UpdateBookshelfRequest>) => void;
  onOpenShare: () => void;
}

export function Step3Phrase({ phrase, onChange, onOpenShare }: Step3Props) {
  return (
    <FunnelStepLayout
      title="마음에 남은 문장이 있나요?"
      description="공유하고 싶은 한 줄을 적어주세요."
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold text-[#7C9885] flex items-center gap-2 tracking-wider">
              <Quote size={14} /> 문장 적기
            </label>

            <button
              onClick={onOpenShare}
              disabled={!phrase}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                phrase
                  ? "bg-[#7C9885]/10 text-[#7C9885] active:scale-95"
                  : "text-gray-300 cursor-not-allowed opacity-50"
              }`}
            >
              <Share2 size={14} />
              <span className="text-[11px] font-bold">이미지로 공유</span>
            </button>
          </div>

          <textarea
            value={phrase}
            onChange={(e) => onChange({ phrase: e.target.value })}
            placeholder="공유하고 싶은 책 속의 문장을 적어보세요."
            className="w-full p-4 bg-[#F9FAFB] rounded-2xl min-h-[300px] text-sm outline-none focus:ring-2 ring-[#7C9885]/20 resize-none border-none"
          />

          <p className="text-[11px] text-gray-400 text-center mt-2">
            기록 완료 후 이미지 카드로 저장할 수 있어요
          </p>
        </div>
      </div>
    </FunnelStepLayout>
  );
}
