import { BOOK_STATUS, STATUS_STYLE } from "@/shared/constants/book_status";
import type { BookStatus } from "../type";

export function BookStatusBadge({ status }: { status: BookStatus }) {
  const statusInfo = BOOK_STATUS.find((s) => s.value === status);

  if (!statusInfo) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-full font-bold ${STATUS_STYLE[status]}`}
    >
      <span>{statusInfo.emoji}</span>
      {statusInfo.label}
    </span>
  );
}
