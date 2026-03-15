"use client";

import { useAuthStore } from "@/shared/store/useAuthStore";
import { ChevronLeft, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { BottomNav } from "../../shared/components/layout/BottomNav";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const needsBackButton =
    pathname.startsWith("/bookshelf/") && pathname !== "/bookshelf";

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/mypage");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-sm">
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
            onClick={handleProfileClick}
            className="flex items-center justify-center min-w-[44px] transition-all active:scale-95"
          >
            {isLoggedIn ? (
              <div className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200">
                <User size={22} className="text-gray-600" />
              </div>
            ) : (
              <span className="text-sm font-medium text-[rgb(var(--primary-sage))] hover:text-[rgb(var(--secondary-sage-light))]">
                로그인
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 pb-16 bg-gray-50 overflow-y-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
