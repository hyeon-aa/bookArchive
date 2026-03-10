"use client";

import { useModal } from "@/shared/hooks/useModal";
import { Sparkles } from "lucide-react";

type Props = {
  onConfirm: () => void;
};

export function ReviewRedirectModal({ onConfirm }: Props) {
  const { close } = useModal();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto w-16 h-16 bg-[#F8FAF9] rounded-full flex items-center justify-center mb-6">
          <Sparkles className="text-[#7C9885]" size={32} />
        </div>

        <h2 className="text-xl font-bold mb-2 text-[#333]">
          완독을 축하드려요! 🎉
        </h2>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          책을 읽으며 느꼈던 소중한 감정들을
          <br />
          지금 바로 기록해볼까요?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm();
              close();
            }}
            className="w-full py-4 bg-[#7C9885] text-white rounded-2xl font-bold shadow-lg shadow-[#7C9885]/20 hover:bg-[#6B8573] transition-all"
          >
            지금 바로 기록하기
          </button>

          <button
            onClick={() => {
              close();
            }}
            className="w-full py-4 text-gray-400 font-medium hover:text-gray-600 transition-colors"
          >
            나중에 할래요
          </button>
        </div>
      </div>
    </div>
  );
}
