import { useModalStore } from "@/shared/store/useModalStore";
import { ReactNode } from "react";

export const useModal = () => {
  const { openModal, closeModal } = useModalStore();

  const open = (content: () => ReactNode) => {
    openModal(content);
  };

  const close = () => {
    closeModal();
  };

  return { open, close };
};
