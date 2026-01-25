"use client";

import {
  BookOpen,
  ChevronLeft,
  LayoutGrid,
  Search,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const needsBackButton =
    pathname.startsWith("/bookshelf/") && pathname !== "/bookshelf";

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {needsBackButton ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-bold text-gray-800">독서 기록</h1>
            </div>
          ) : (
            <h1 className="text-lg font-bold text-gray-800">책 아카이브</h1>
          )}

          <button
            onClick={() => router.push("/login")}
            className="
              text-sm font-medium
              text-[rgb(var(--primary-sage))]
              hover:text-[rgb(var(--secondary-sage-light))]
              active:opacity-80
              transition-colors
            "
          >
            로그인
          </button>
        </div>
      </header>

      <main className="flex-1 pb-16 bg-gray-50 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 z-10 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => router.push("/explore")}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <div
              className={`flex items-center justify-center mb-0.5 w-9 h-9 rounded-xl transition-colors ${
                pathname === "/explore"
                  ? "bg-[#7C9885]"
                  : "bg-transparent active:bg-[#7C9885]/15"
              }`}
            >
              <Sparkles
                className={`w-5 h-5 ${
                  pathname === "/explore" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                pathname === "/explore" ? "text-[#7C9885]" : "text-gray-600"
              }`}
            >
              탐색
            </span>
          </button>

          <button
            onClick={() => router.push("/books/search")}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <div
              className={`flex items-center justify-center mb-0.5 w-9 h-9 rounded-xl transition-colors ${
                pathname === "/books/search"
                  ? "bg-[#7C9885]"
                  : "bg-transparent active:bg-[#7C9885]/15"
              }`}
            >
              <Search
                className={`w-5 h-5 ${
                  pathname === "/books/search" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                pathname === "/books/search"
                  ? "text-[#7C9885]"
                  : "text-gray-600"
              }`}
            >
              검색
            </span>
          </button>

          <button
            onClick={() => router.push("/bookshelf")}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <div
              className={`flex items-center justify-center mb-0.5 w-9 h-9 rounded-xl transition-colors ${
                pathname === "/bookshelf"
                  ? "bg-[#7C9885]"
                  : "bg-transparent active:bg-[#7C9885]/15"
              }`}
            >
              <BookOpen
                className={`w-5 h-5 ${
                  pathname === "/bookshelf" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                pathname === "/bookshelf" ? "text-[#7C9885]" : "text-gray-600"
              }`}
            >
              내 책장
            </span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <div
              className={`flex items-center justify-center mb-0.5 w-9 h-9 rounded-xl transition-colors ${
                pathname === "/dashboard"
                  ? "bg-[#7C9885]"
                  : "bg-transparent active:bg-[#7C9885]/15"
              }`}
            >
              <LayoutGrid
                className={`w-5 h-5 ${
                  pathname === "/dashboard" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                pathname === "/dashboard" ? "text-[#7C9885]" : "text-gray-600"
              }`}
            >
              대시보드
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
