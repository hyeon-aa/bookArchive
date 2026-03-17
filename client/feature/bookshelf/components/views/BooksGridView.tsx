"use client";

import { EMOTION_EMOJIS } from "@/shared/constants/emotion";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookshelfItemResponse } from "../../type";

interface Props {
  books: BookshelfItemResponse[];
  isEditMode: boolean;
  selectedIds: number[];
  onSelect: (id: number) => void;
}

export const BooksGridView = ({
  books,
  isEditMode,
  selectedIds,
  onSelect,
}: Props) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 gap-3">
      {books.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <motion.div
            key={item.id}
            layout
            animate={{
              scale: isSelected ? 0.9 : 1,
            }}
            whileHover={{
              y: -6,
              scale: isSelected ? 0.94 : 1.04,
            }}
            whileTap={{ scale: 0.92 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            onClick={() =>
              isEditMode
                ? onSelect(item.id)
                : router.push(`/bookshelf/${item.id}`)
            }
            className={`aspect-[2/3] relative rounded-xl overflow-hidden shadow-sm border cursor-pointer ${
              isSelected ? "ring-4 ring-[#FF5F5F]" : "border-[#F5F0E6]"
            }`}
          >
            <Image
              src={item.book.imageUrl}
              alt={item.book.title}
              fill
              sizes="100px"
              className="object-cover"
            />
            {isEditMode ? (
              <div
                className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 transition-all ${
                  isSelected
                    ? "bg-[#FF5F5F] border-[#FF5F5F] text-white"
                    : "bg-white/90 border-[#F5F0E6] text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={4} />
              </div>
            ) : (
              item.emotion && (
                <div className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-sm shadow-md border border-[#F5F0E6]">
                  {EMOTION_EMOJIS[item.emotion as keyof typeof EMOTION_EMOJIS]}
                </div>
              )
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
