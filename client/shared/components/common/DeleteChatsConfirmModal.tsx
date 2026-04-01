"use client";

import { useDeleteChats } from "@/feature/chat/queries";
import { ConfirmModal } from "@/shared/components/common/ConfirmModal";
import { useModal } from "@/shared/hooks/useModal";

interface DeleteChatsConfirmModalProps {
  selectedIds: number[];
  onSuccess: () => void;
}

export function DeleteChatsConfirmModal({
  selectedIds,
  onSuccess,
}: DeleteChatsConfirmModalProps) {
  const { mutate: DeleteChats, isPending } = useDeleteChats();
  const { close } = useModal();

  const handleConfirm = () => {
    DeleteChats(selectedIds, {
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
          선택하신 {selectedIds.length}개의 채팅정보와
          <br />
          채팅창에 입력한 대화가 모두 삭제됩니다.
        </>
      }
      onConfirm={handleConfirm}
      isPending={isPending}
      confirmText="삭제하기"
    />
  );
}
