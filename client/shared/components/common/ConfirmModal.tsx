"use client";

import { useModal } from "@/shared/hooks/useModal";
import { LucideIcon, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  icon?: LucideIcon;
}

export function ConfirmModal({
  onConfirm,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  isPending,
  icon: Icon = Trash2,
}: ConfirmModalProps) {
  const { close } = useModal();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-5 pb-10 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFEDED] text-[#FF5F5F] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon size={32} />
          </div>

          <h3 className="text-xl font-black text-[#4A4A4A] mb-2">{title}</h3>

          <div className="text-sm text-[#A6BCAF]">{description}</div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={close}
            className="flex-1 py-4 bg-[#F8F9F7] text-[#7C9885] font-bold rounded-2xl"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-4 bg-[#FF5F5F] text-white font-bold rounded-2xl"
          >
            {isPending ? "처리 중..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
