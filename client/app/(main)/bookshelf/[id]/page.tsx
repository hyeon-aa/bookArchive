"use client";

import { BookshelfEditForm } from "@/feature/bookshelf/components/BookshelfEditForm";
import { useBookshelfItem } from "@/feature/bookshelf/queries";
import { useParams } from "next/navigation";

export default function BookshelfDetailPage() {
  const params = useParams();
  const bookId = Number(params.id);
  const { data: item, isLoading } = useBookshelfItem(bookId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F8F9F7]">
        <p className="text-[#A6BCAF] font-bold animate-pulse text-sm tracking-widest uppercase">
          Loading...
        </p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <BookshelfEditForm key={item.id} item={item} />
      </div>
    </div>
  );
}
