"use client";

import { useBookInfiniteSearch } from "@/feature/books/queries";
import type { BookSearchResponse } from "@/feature/books/type";
import { BookStatusModal } from "@/feature/bookshelf/components/BookStatusModal";
import { ReviewRedirectModal } from "@/feature/bookshelf/components/ReviewRedirectModal";
import { useAddBook } from "@/feature/bookshelf/queries";
import { BookStatus } from "@/feature/bookshelf/type";
import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
import { useModal } from "@/shared/hooks/useModal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookSearchPage() {
  const router = useRouter();
  const { open } = useModal();

  const [query, setQuery] = useState("");

  const {
    data,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookInfiniteSearch(query);

  const observerRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, hasNextPage);

  const books = data?.pages.flat() ?? [];

  const { mutate: addBook, isPending: isAdding } = useAddBook();

  const handleSearch = () => {
    if (!query.trim()) return;
    refetch();
  };

  const handleSelectStatus = (book: BookSearchResponse, status: BookStatus) => {
    addBook(
      {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        description: book.description,
        status,
      },
      {
        onSuccess: (data) => {
          if (status === "DONE") {
            open(() => (
              <ReviewRedirectModal
                onConfirm={() => router.push(`/bookshelf/${data.id}`)}
              />
            ));
          } else {
            alert("내 책장에 등록되었습니다 📚");
          }
        },
        onError: () => {
          alert("등록에 실패했습니다.");
        },
      }
    );
  };

  const handleOpenModal = (book: BookSearchResponse) => {
    open(() => (
      <BookStatusModal
        onSelect={(status) => handleSelectStatus(book, status)}
      />
    ));
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

        {isFetching && <p className="text-gray-500">검색 중...</p>}

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
                style={{ height: "auto" }}
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
                등록하기
              </button>
            </li>
          ))}
        </ul>

        <div
          ref={observerRef}
          className="h-20 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <p className="text-gray-500">데이터를 더 불러오는 중...</p>
          )}

          {!hasNextPage && books.length > 0 && (
            <p className="text-gray-400 text-sm">마지막 결과입니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
