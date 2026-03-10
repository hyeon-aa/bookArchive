import { BookOpen, LayoutGrid, Search, Sparkles } from "lucide-react";

export const BOTTOM_NAV_ITEMS = [
  {
    label: "탐색",
    path: "/explore",
    icon: Sparkles,
  },
  {
    label: "검색",
    path: "/books/search",
    icon: Search,
  },
  {
    label: "내 책장",
    path: "/bookshelf",
    icon: BookOpen,
  },
  {
    label: "대시보드",
    path: "/dashboard",
    icon: LayoutGrid,
  },
] as const;
