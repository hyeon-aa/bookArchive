import { ReactNode } from "react";
import { create } from "zustand";

type ModalContent = () => ReactNode;

interface ModalStore {
  content: ModalContent | null;
  openModal: (content: ModalContent) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  content: null,

  openModal: (content) =>
    set({
      content,
    }),

  closeModal: () =>
    set({
      content: null,
    }),
}));
