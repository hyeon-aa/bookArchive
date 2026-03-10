"use client";

import { useModalStore } from "../shared/store/useModalStore";

export function ModalProvider() {
  const { content, closeModal } = useModalStore();

  if (!content) return null;

  const Content = content;

  return (
    <div onClick={closeModal}>
      <div onClick={(e) => e.stopPropagation()}>
        <Content />
      </div>
    </div>
  );
}
