import { BookStatus } from "@/feature/bookshelf/type";

export const BOOK_STATUS: {
  label: string;
  emoji: string;
  value: BookStatus;
}[] = [
  { label: "읽기 전", emoji: "⭐", value: "BEFORE" },
  { label: "읽는 중", emoji: "📖", value: "READING" },
  { label: "완독", emoji: "✅", value: "DONE" },
];

export const STATUS_STYLE: Record<BookStatus, string> = {
  BEFORE: "bg-gray-100 text-gray-500 border border-gray-200",
  READING: "bg-[#7C9885]/15 text-[#6B8574] border border-[#7C9885]/30",
  DONE: "bg-[#7C9885] text-white border-none shadow-sm",
};
