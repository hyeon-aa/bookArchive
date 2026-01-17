"use client";

import { bookshelfApi } from "@/feature/bookshelf/api";
import { BookshelfItem } from "@/feature/bookshelf/components/BookshelfItem";
import type { BookshelfItem as Item } from "@/feature/bookshelf/type";
import { useEffect, useState } from "react";

export default function BookshelfPage() {
  const [books, setBooks] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookshelfApi.getMyBooks();
        setBooks(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <p className="text-center mt-20 text-gray-500">불러오는 중...</p>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-5">
        {books.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            아직 등록한 책이 없어요 📚
          </div>
        ) : (
          <ul className="space-y-4">
            {books.map((item) => (
              <BookshelfItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
