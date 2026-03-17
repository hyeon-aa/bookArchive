"use client";

import { BookshelfItem } from "@/feature/bookshelf/components/BookshelfItem";
import { Check } from "lucide-react";
import { motion } from "motion/react";
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
          <motion.li
            layout
            whileHover={{
              y: -4,
              scale: 1.01,
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.18 }}
            key={item.id}
            onClick={() =>
              isEditMode
                ? onSelect(item.id)
                : router.push(`/bookshelf/${item.id}`)
            }
            className="relative cursor-pointer"
          >
            <div
              className={`transition-opacity ${isSelected ? "opacity-50" : ""}`}
            >
              <BookshelfItem item={item} />
            </div>
            {isEditMode && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected ? 1 : 0,
                  opacity: isSelected ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className={`absolute -right-1 -top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isSelected
                    ? "bg-[#FF5F5F] border-[#FF5F5F] text-white"
                    : "bg-white border-[#F5F0E6] text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={4} />
              </motion.div>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
};
