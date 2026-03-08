import { bookshelfApi } from "@/feature/bookshelf/api";
import { BookStatus } from "@/feature/bookshelf/type";
import { BookHeart, Compass, Plus, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { RecommendBookItemResponse, TasteRecommendResponse } from "../type";

interface TasteRecommendationProps {
  tasteData: TasteRecommendResponse | null;
  isLoading: boolean;
}

export function TasteRecommendation({
  tasteData,
  isLoading,
}: TasteRecommendationProps) {
  if (isLoading) {
    return (
      <div className="mt-10 space-y-4 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-2xl w-full" />
        <div className="h-40 bg-gray-100 rounded-2xl w-full" />
      </div>
    );
  }

  if (!tasteData) return null;

  const handleAddToLibrary = async (book: RecommendBookItemResponse) => {
    try {
      await bookshelfApi.addBook({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        status: "BEFORE" as BookStatus,
        description: book.description,
      });

      alert(`${book.title}이(가) 내 책장에 담겼습니다 📚`);
    } catch (e) {
      console.error(e);
      alert("이미 담긴 책이거나 저장에 실패했어요");
    }
  };

  return (
    <div className="mt-12 space-y-10">
      <div className="relative bg-gradient-to-br from-[#7C9885]/8 to-[#7C9885]/5 border border-[#7C9885]/20 rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#7C9885]/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-[#7C9885]/10 rounded-lg">
              <Sparkles size={14} className="text-[#7C9885]" />
            </div>
            <span className="text-[12px] font-bold text-[#7C9885]">
              당신의 독서 무드
            </span>
          </div>
          <p className="text-[14px] text-[#5A6A5F] leading-relaxed break-keep">
            {tasteData.tasteSummary}
          </p>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookHeart size={16} className="text-[#7C9885]" />
          <h2 className="text-[15px] font-bold text-[#3F3F3F]">
            취향에 꼭 맞는 책
          </h2>
        </div>
        <div className="space-y-3">
          {tasteData.familiarBooks.map((item, i) => (
            <div
              key={i}
              className="group flex gap-4 p-4 rounded-2xl bg-white border border-[#EEF0ED] shadow-sm hover:shadow-md hover:border-[#7C9885]/20 transition-all"
            >
              <div className="relative w-14 h-20 flex-shrink-0">
                <Image
                  src={item.book.imageUrl || "/placeholder-book.png"}
                  alt={item.book.title}
                  fill
                  sizes="56px"
                  className="rounded object-cover shadow-sm"
                />
                <div className="absolute -top-1 -right-1 bg-[#7C9885] rounded-full p-1">
                  <Star size={8} className="text-white fill-white" />
                </div>
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-[13px] font-bold text-[#3F3F3F] group-hover:text-[#7C9885] transition-colors">
                    {item.book.title}
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF] mb-1">
                    {item.book.author}
                  </p>
                  <p className="text-[10px] text-[#7C857E] line-clamp-1">
                    {item.reason}
                  </p>
                </div>

                <button
                  onClick={() => handleAddToLibrary(item.book)}
                  className="mt-2 flex items-center justify-center gap-1 py-2 rounded-xl
                   bg-[#F1F5F2] text-[#7C9885] text-[10px] font-bold
                   hover:bg-[#7C9885] hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  <Plus size={12} />내 책장에 담기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-[#A6BCAF]/10 rounded-lg">
            <Compass size={14} className="text-[#A6BCAF]" />
          </div>
          <h2 className="text-[15px] font-bold text-[#3F3F3F]">새로운 시도</h2>
          <span className="text-[10px] bg-[#A6BCAF]/10 text-[#A6BCAF] px-2 py-0.5 rounded-full font-bold">
            Challenge
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tasteData.challengeBooks.map((item, i) => (
            <div
              key={i}
              className="group p-4 rounded-2xl border border-[#EEF0ED] bg-white shadow-sm hover:shadow-md hover:border-[#A6BCAF]/20 transition-all flex flex-col"
            >
              <div className="relative w-full aspect-[3/4] mb-3">
                <Image
                  src={item.book.imageUrl || "/placeholder-book.png"}
                  alt={item.book.title}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>

              <h3 className="text-[12px] font-bold text-[#3F3F3F] line-clamp-1 group-hover:text-[#A6BCAF] transition-colors">
                {item.book.title}
              </h3>
              <p className="text-[10px] text-[#9CA3AF] line-clamp-1 mb-2">
                {item.book.author}
              </p>

              <button
                onClick={() => handleAddToLibrary(item.book)}
                className="mt-auto flex items-center justify-center gap-1 py-2 rounded-xl
                 bg-[#F1F5F2] text-[#7C9885] text-[10px] font-bold
                 hover:bg-[#7C9885] hover:text-white transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
                담기
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
