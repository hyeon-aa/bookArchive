"use client";

import { useDeleteBooks } from "@/feature/bookshelf/queries";
import { ConfirmModal } from "@/shared/components/common/ConfirmModal";
import { useModal } from "@/shared/hooks/useModal";

interface DeleteConfirmModalProps {
  selectedIds: number[];
  onSuccess: () => void;
}

export function DeleteConfirmModal({
  selectedIds,
  onSuccess,
}: DeleteConfirmModalProps) {
  const { mutate: deleteBooks, isPending } = useDeleteBooks();
  const { close } = useModal();

  const handleConfirm = () => {
    deleteBooks(selectedIds, {
      onSuccess: () => {
        onSuccess();
        close();
      },
    });
  };

  return (
    <ConfirmModal
      title="삭제할까요?"
      description={
        <>
          선택하신 {selectedIds.length}권의 도서 정보와
          <br />
          관련된 AI 분석 데이터가 모두 삭제됩니다.
        </>
      }
      onConfirm={handleConfirm}
      isPending={isPending}
      confirmText="삭제하기"
    />
  );
}
