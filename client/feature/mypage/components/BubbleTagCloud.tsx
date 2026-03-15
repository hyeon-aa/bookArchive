"use client";

import { TagStat } from "../type";

interface BubbleTagCloudProps {
  tags: TagStat[];
}

export function BubbleTagCloud({ tags }: BubbleTagCloudProps) {
  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 py-10 px-4">
      {tags.map((tag) => {
        const scale = 0.9 + (tag.count / maxCount) * 0.4;
        const isTop = tag.count === maxCount && tag.count > 1;

        return (
          <div
            key={tag.name}
            style={{ transform: `scale(${scale})` }}
            className={`
              px-5 py-2.5 rounded-full font-bold transition-all duration-300
              cursor-default hover:shadow-md active:scale-95
              ${
                isTop
                  ? "bg-[rgb(var(--primary-sage))] text-white shadow-[0_10px_20px_-5px_rgba(var(--primary-sage),0.4)]"
                  : "bg-white text-gray-500 border border-gray-100 shadow-sm"
              }
            `}
          >
            <span className="text-xs opacity-70 mr-1 font-medium">#</span>
            {tag.name}
            {tag.count > 1 && (
              <span
                className={`ml-1.5 text-[10px] ${
                  isTop ? "text-white/70" : "text-gray-300"
                }`}
              >
                {tag.count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
