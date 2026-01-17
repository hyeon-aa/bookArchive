import type { BookStatus } from "../type";

const STATUS_LABEL: Record<BookStatus, string> = {
  BEFORE: "읽기 전",
  READING: "읽는 중",
  DONE: "완독",
};

const STATUS_STYLE: Record<BookStatus, string> = {
  BEFORE: "bg-gray-100 text-gray-600",
  READING: "bg-[rgb(var(--secondary-peach))] text-gray-700",
  DONE: "bg-[rgb(var(--accent-mint))] text-gray-700",
};

export function BookStatusBadge({ status }: { status: BookStatus }) {
  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
