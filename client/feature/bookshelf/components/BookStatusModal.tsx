"use client";

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-6 text-center">책 상태 선택</h2>

        <div className="flex gap-3">
          <button
            onClick={() => onSelect("BEFORE")}
            className="flex-1 py-3 rounded-lg border hover:bg-gray-50"
          >
            ⭐ 읽기 전
          </button>

          <button
            onClick={() => onSelect("READING")}
            className="flex-1 py-3 rounded-lg border hover:bg-gray-50"
          >
            📖 읽는 중
          </button>

          <button
            onClick={() => onSelect("DONE")}
            className="flex-1 py-3 rounded-lg border hover:bg-gray-50"
          >
            ✅ 완독
          </button>
        </div>
      </div>
    </div>
  );
}
