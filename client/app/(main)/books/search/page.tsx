"use client";

import { useBookSearch } from "@/feature/books/queries";
import type { BookSearch } from "@/feature/books/type";
import { BookStatusModal } from "@/feature/bookshelf/components/BookStatusModal";
import { useAddBook } from "@/feature/bookshelf/queries";
import { BookStatus } from "@/feature/bookshelf/type";
import Image from "next/image";
import { useState } from "react";

export default function BookSearchPage() {
  const [query, setQuery] = useState("");
  const { data: books = [], isLoading, refetch } = useBookSearch(query);
  const { mutate: addBook, isPending: isAdding } = useAddBook();

  const [selectedBook, setSelectedBook] = useState<BookSearch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    refetch();
  };

  const handleOpenModal = (book: BookSearch) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleSelectStatus = (status: BookStatus) => {
    if (!selectedBook) return;

    setModalOpen(false);
    setSelectedBook(null);

    addBook(
      {
        isbn: selectedBook.isbn,
        title: selectedBook.title,
        author: selectedBook.author,
        imageUrl: selectedBook.imageUrl,
        description: selectedBook.description,
        status,
      },
      {
        onSuccess: () => {
          alert("내 책장에 등록되었습니다 📚");
        },
        onError: () => {
          alert("등록에 실패했습니다.");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-5">
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

        {isLoading && <p className="text-gray-500">검색 중...</p>}

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

              <button
                onClick={() => handleOpenModal(book)}
                disabled={isAdding}
                className="self-center px-4 py-2 text-sm rounded-md border 
    border-[rgb(var(--primary-sage))] 
    text-[rgb(var(--primary-sage))] 
    hover:bg-[rgb(var(--accent-cream))]"
              >
                {isAdding && selectedBook?.isbn === book.isbn
                  ? "등록 중!"
                  : "등록하기"}
              </button>
            </li>
          ))}
        </ul>
        <BookStatusModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={handleSelectStatus}
        />
      </div>
    </div>
  );
}
