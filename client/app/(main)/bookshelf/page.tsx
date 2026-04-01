"use client";

import { BooksGridView } from "@/feature/bookshelf/components/views/BooksGridView";
import { BooksListView } from "@/feature/bookshelf/components/views/BooksListView";
import { useMyBooks } from "@/feature/bookshelf/queries";
import { DeleteBooksConfirmModal } from "@/shared/components/common/DeleteBooksConfirmModal";
import { useModal } from "@/shared/hooks/useModal";
import { LayoutGrid, List, Trash2 } from "lucide-react";
import { useState } from "react";

export default function BookshelfPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { open } = useModal();

  const { data: books = [], isLoading } = useMyBooks();

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }
      return [...prev, id];
    });
  };

  const openDeleteModal = () => {
    open(() => (
      <DeleteBooksConfirmModal
        selectedIds={selectedIds}
        onSuccess={() => {
          setIsEditMode(false);
          setSelectedIds([]);
        }}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-[#A6BCAF] font-bold animate-pulse text-sm uppercase tracking-widest">
          로딩중
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7] relative">
      <div className="max-w-md mx-auto px-5 pt-8 pb-32">
        <header className="flex justify-between items-center mb-10 px-1">
          <div>
            <h1 className="text-2xl font-black text-[#4A4A4A] tracking-tight">
              내 서재
            </h1>
            <p className="text-[11px] text-[#A6BCAF] font-medium mt-0.5">
              총 <span className="text-[#7C9885]">{books.length}</span>권의 기록
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSelectedIds([]);
              }}
              className={`h-10 px-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                isEditMode
                  ? "bg-[#FF5F5F] text-white shadow-lg shadow-[#FF5F5F]/20"
                  : "bg-white text-[#7C9885] border border-[#7C9885]/20"
              }`}
            >
              {isEditMode ? "취소" : "선택"}
            </button>

            <div className="flex bg-[#F5F0E6]/50 p-1 rounded-2xl border border-[#7C9885]/10 backdrop-blur-sm">
              {(["list", "grid"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-[10px] transition-all ${
                    viewMode === mode
                      ? "bg-white shadow-sm text-[#7C9885]"
                      : "text-[#A6BCAF]"
                  }`}
                >
                  {mode === "list" ? (
                    <List size={16} />
                  ) : (
                    <LayoutGrid size={16} />
                  )}
                </button>
              ))}
            </div>
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
          <BooksListView
            books={books}
            isEditMode={isEditMode}
            selectedIds={selectedIds}
            onSelect={toggleSelect}
          />
        ) : (
          <BooksGridView
            books={books}
            isEditMode={isEditMode}
            selectedIds={selectedIds}
            onSelect={toggleSelect}
          />
        )}
      </div>

      {isEditMode && selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs px-5 z-40">
          <button
            onClick={openDeleteModal}
            className="w-full py-4 bg-[#4A4A4A] text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Trash2 size={18} />
            {selectedIds.length}권 삭제하기
          </button>
        </div>
      )}
    </div>
  );
}
