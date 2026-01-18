import type { BookStatus } from "../type";

const STATUS_LABEL: Record<BookStatus, string> = {
  BEFORE: "읽기 전",
  READING: "읽는 중",
  DONE: "완독",
};

const STATUS_STYLE: Record<BookStatus, string> = {
  BEFORE: "bg-gray-100 text-gray-600 border border-gray-200",
  READING:
    "bg-gradient-to-r from-[#FFA07A]/20 to-[#FFB347]/20 text-[#FF8C42] border border-[#FFA07A]/30",
  DONE: "bg-gradient-to-r from-[#7C9885] to-[#A6BCAF] text-white border-none shadow-sm",
};

export function BookStatusBadge({ status }: { status: BookStatus }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[11px] rounded-full font-bold ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
