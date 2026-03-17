"use client";

import { useGetBookTimeLine } from "@/feature/mypage/queries";
import { BookOpenText, ChevronLeft, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
} as const;

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
} as const;

const branchVariants = {
  hidden: { x: -25, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35 },
  },
};

export default function TimelinePage() {
  const router = useRouter();
  const { data: timelineData, isLoading } = useGetBookTimeLine();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[rgb(var(--primary-sage))]/20 border-t-[rgb(var(--primary-sage))] rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = Array.isArray(timelineData) && timelineData.length > 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
      <header className="bg-white px-4 py-3 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">독서 타임라인</h1>
        </div>
      </header>

      <main className="p-6 relative pb-20">
        {!hasData ? (
          <div className="py-20 flex flex-col items-center text-center">
            <Clock size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">
              아직 완독한 기록이 없네요.
              <br />다 읽은 책들로 타임라인을 채워보세요!
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative"
          >
            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gray-200" />

            {timelineData.map((item, index) => {
              const [year, month] = item.month.split("-");

              return (
                <motion.div
                  key={`${item.month}-${index}`}
                  variants={itemVariants}
                  className="relative pl-14 pb-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-[6px] top-1 w-8 h-8 bg-white border-2 border-[rgb(var(--primary-sage))] rounded-full flex items-center justify-center z-10"
                  >
                    <span className="text-[10px] font-bold text-[rgb(var(--primary-sage))]">
                      {parseInt(month)}월
                    </span>
                  </motion.div>

                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-700">
                      {year}년 {parseInt(month)}월
                    </h3>
                    <span className="text-xs text-gray-400">
                      {item.books.length}권 완독
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {item.books.map((title: string, idx: number) => (
                      <motion.li
                        key={`${title}-${idx}`}
                        variants={branchVariants}
                        className="relative flex items-start gap-3 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <span className="absolute -left-6 top-4 w-6 h-[2px] bg-gray-200" />

                        <BookOpenText
                          size={16}
                          className="text-[rgb(var(--primary-sage))] mt-[2px] shrink-0"
                        />

                        <span className="font-medium leading-tight">
                          {title}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
