"use client";

import { CHARACTER_LEVELS } from "@/shared/constants/character_level";
import Image from "next/image";

interface MyPageProfileProps {
  nickname: string;
  level: number;
  isMember: boolean;
}

export function MyPageProfile({
  nickname,
  level,
  isMember,
}: MyPageProfileProps) {
  const currentCharacter =
    CHARACTER_LEVELS.find((c) => c.level === level) || CHARACTER_LEVELS[0];

  return (
    <section className="relative bg-gradient-to-b from-[rgb(var(--primary-sage))] to-[rgb(var(--secondary-sage-light))] pt-8 pb-20 px-6 overflow-hidden">
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="flex items-center gap-5 relative z-10">
        <div className="relative bg-white p-1 rounded-full shadow-lg border-2 border-white/50">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
            <Image
              src={currentCharacter.imageUrl}
              alt={currentCharacter.name}
              width={130}
              height={130}
              priority
              className="object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#7C9885] text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md">
            LV.{level}
          </div>
        </div>

        <div className="text-white">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-bold leading-none">{nickname}님</h2>
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm font-medium">
              {isMember ? "pro회원" : "일반 회원"}
            </span>
          </div>
          <p className="text-sm text-white/80 mt-2 font-medium">
            오늘도 문장 사이를 탐험 중 🌿
          </p>
        </div>
      </div>
    </section>
  );
}
