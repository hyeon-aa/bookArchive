"use client";

import * as Drawer from "vaul";

export function AIMessageSheet({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />

        <Drawer.Content
          className="
            fixed bottom-0 left-0 right-0 z-50
            rounded-t-[2rem] bg-white
            px-6 pt-6 pb-10
            focus:outline-none
          "
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" />

          <div className="text-center space-y-4">
            <div className="text-2xl">🌿</div>

            <h3 className="font-bold text-[#4A4A4A] text-lg">AI의 한마디</h3>

            <p className="text-[#7C9885] leading-relaxed text-[15px] whitespace-pre-line">
              {message}
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full h-12 rounded-xl bg-[#7C9885] text-white font-bold"
            >
              고마워요
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
