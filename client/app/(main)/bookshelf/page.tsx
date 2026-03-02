"use client";

import { EMOTION_EMOJIS } from "@/app/constants/emotion";
import { bookshelfApi } from "@/feature/bookshelf/api";
import { BookshelfItem } from "@/feature/bookshelf/components/BookshelfItem";
import type { BookshelfItem as Item } from "@/feature/bookshelf/type";
import { LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookshelfPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-[#A6BCAF] font-bold animate-pulse text-sm uppercase tracking-widest">
          Loading library...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto px-5 pt-8 pb-20">
        <header className="flex justify-between items-end mb-8 px-1">
          <div>
            <h1 className="text-2xl font-black text-[#4A4A4A]">내 서재</h1>
            <p className="text-[11px] text-[#7C9885] font-bold mt-1 uppercase tracking-tighter">
              {books.length} books collected
            </p>
          </div>

          <div className="flex bg-[#F5F0E6] p-1 rounded-xl border border-[#7C9885]/10">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-[#7C9885]"
                  : "text-[#A6BCAF]"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-[#7C9885]"
                  : "text-[#A6BCAF]"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </header>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-[#F5F0E6]">
            <span className="text-4xl mb-4 grayscale">📚</span>
            <p className="text-[#A6BCAF] font-medium text-sm">
              아직 등록한 책이 없어요.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <ul className="space-y-4">
            {books.map((item) => (
              <li
                key={item.id}
                onClick={() => router.push(`/bookshelf/${item.id}`)}
                className="cursor-pointer transition-transform active:scale-[0.97]"
              >
                <BookshelfItem item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {books.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/bookshelf/${item.id}`)}
                className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-sm border border-[#F5F0E6] cursor-pointer transition-transform active:scale-[0.95] group"
              >
                <Image
                  src={item.book.imageUrl}
                  alt={item.book.title}
                  fill
                  className="object-cover"
                />
                {item.emotion && (
                  <div className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-sm shadow-md border border-[#F5F0E6]">
                    {EMOTION_EMOJIS[item.emotion] || "✨"}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-white text-[10px] font-bold line-clamp-2 leading-tight">
                    {item.book.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
