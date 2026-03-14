"use client";

import { BookStatus } from "@/feature/bookshelf/type";
import { BOOK_STATUS } from "@/shared/constants/book_status";
import { useModal } from "@/shared/hooks/useModal";
import { X } from "lucide-react";

type BookStatusModalProps = {
  onSelect: (status: BookStatus) => void;
};

export function BookStatusModal({ onSelect }: BookStatusModalProps) {
  const { close } = useModal();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <button
          onClick={close}
          className="absolute right-4 top-4 text-gray-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-6 text-center">책 상태 선택</h2>

        <div className="flex gap-3">
          {BOOK_STATUS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                close();
              }}
              className="flex-1 py-3 flex flex-col items-center gap-1 rounded-xl border"
            >
              <span className="text-xl">{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
