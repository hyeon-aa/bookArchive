"use client";

import { BOTTOM_NAV_ITEMS } from "@/shared/constants/bottom_nav";
import { usePathname, useRouter } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 z-10 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);

          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <div
                className={`flex items-center justify-center mb-0.5 w-9 h-9 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#7C9885]"
                    : "bg-transparent active:bg-[#7C9885]/15"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>

              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-[#7C9885]" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
