"use client";

import { BOOK_STATUS } from "@/app/constants/book_status";
import { BookStatus } from "@/feature/bookshelf/type";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (status: BookStatus) => void;
};

export function BookStatusModal({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-6 text-center">책 상태 선택</h2>

        <div className="flex gap-3">
          {BOOK_STATUS.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className="flex-1 py-3 flex flex-col items-center gap-1 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-medium"
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
