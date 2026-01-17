"use client";

import { bookSearchApi } from "@/feature/books/api";
import type { BookSearch } from "@/feature/books/type";
import Image from "next/image";
import { useState } from "react";

export default function BookSearchPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookSearch[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await bookSearchApi.search(query);
      setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">📚 책 검색</h1>

        <div className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="책 제목이나 저자를 입력하세요"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-sage))]"
          />

          <button
            onClick={handleSearch}
            className="px-5 py-2 rounded-md text-white bg-[rgb(var(--primary-sage))] hover:bg-[#5E7365]"
          >
            검색
          </button>
        </div>

        {loading && <p className="text-gray-500">검색 중...</p>}

        {!loading && books.length === 0 && (
          <div className="text-center mt-20 text-gray-400">
            <p>책 제목이나 저자를 검색해보세요</p>
          </div>
        )}

        <ul className="space-y-4">
          {books.map((book) => (
            <li
              key={book.isbn}
              className="flex gap-4 p-4 bg-white rounded-lg shadow"
            >
              <Image
                src={book.imageUrl}
                alt={book.title}
                width={80}
                height={112}
                className="object-cover rounded"
              />

              <div className="flex-1">
                <h2 className="font-semibold">{book.title}</h2>
                <p className="text-sm text-gray-500">{book.author}</p>
              </div>

              <button className="self-center px-4 py-2 text-sm rounded-md border border-[rgb(var(--primary-sage))] text-[rgb(var(--primary-sage))] hover:bg-[rgb(var(--accent-cream))]">
                등록하기
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
