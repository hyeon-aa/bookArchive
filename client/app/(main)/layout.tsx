"use client";

import { BookOpen, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-800">책 아카이브</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16 bg-gray-50 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 z-10 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-14">
          <button
            onClick={() => router.push("/books/search")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === "/books/search"
                ? "text-blue-600"
                : "text-gray-600 active:text-gray-800"
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">검색</span>
          </button>

          <button
            onClick={() => router.push("/bookshelf")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === "/bookshelf"
                ? "text-blue-600"
                : "text-gray-600 active:text-gray-800"
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">내 책장</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
