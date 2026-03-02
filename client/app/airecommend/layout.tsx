import { ReactNode } from "react";
import { AIRecommendHeader } from "../../feature/explore/components/AIRecommendHeader";

export default function AIRecommendLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
        <AIRecommendHeader />
        <main className="flex-1 px-5 pt-6 pb-10">{children}</main>
      </div>
    </div>
  );
}
