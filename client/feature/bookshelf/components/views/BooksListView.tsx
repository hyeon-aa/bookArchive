"use client";

import { BookshelfItem } from "@/feature/bookshelf/components/BookshelfItem";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookshelfItemResponse } from "../../type";

interface Props {
  books: BookshelfItemResponse[];
  isEditMode: boolean;
  selectedIds: number[];
  onSelect: (id: number) => void;
}

export const BooksListView = ({
  books,
  isEditMode,
  selectedIds,
  onSelect,
}: Props) => {
  const router = useRouter();

  return (
    <ul className="space-y-4">
      {books.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <li
            key={item.id}
            onClick={() =>
              isEditMode
                ? onSelect(item.id)
                : router.push(`/bookshelf/${item.id}`)
            }
            className="relative cursor-pointer transition-transform active:scale-[0.98]"
          >
            <div
              className={`transition-all ${
                isSelected ? "opacity-50 scale-[0.97]" : ""
              }`}
            >
              <BookshelfItem item={item} />
            </div>
            {isEditMode && (
              <div
                className={`absolute -right-1 -top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  isSelected
                    ? "bg-[#FF5F5F] border-[#FF5F5F] text-white"
                    : "bg-white border-[#F5F0E6] text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={4} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
