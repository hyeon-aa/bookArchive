import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface FunnelFooterProps {
  step: number;
  totalSteps: number;
  isSaving: boolean;
  isValid: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function FunnelFooter({
  step,
  totalSteps,
  isSaving,
  isValid,
  onPrev,
  onNext,
  onSave,
}: FunnelFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md w-full p-5 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-3 pb-10 z-20">
      {step > 1 && (
        <button
          type="button"
          onClick={onPrev}
          className="w-16 h-14 rounded-xl border-2 border-[#F3F4F6] flex items-center justify-center text-gray-400 active:scale-95 transition-transform bg-white"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {step < totalSteps ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 h-14 bg-[#7C9885] text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-300 active:scale-[0.98] transition-all shadow-sm"
        >
          다음 <ChevronRight size={20} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isValid}
          className="flex-1 h-14 bg-[#7C9885] text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-[#7C9885]/20"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} /> AI 분석 중...
            </>
          ) : (
            <>
              <Sparkles size={20} /> 기록 완료하기
            </>
          )}
        </button>
      )}
    </footer>
  );
}
