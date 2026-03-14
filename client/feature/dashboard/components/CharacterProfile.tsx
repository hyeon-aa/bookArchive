import { CHARACTER_LEVELS } from "@/shared/constants/character_level";
import Image from "next/image";

type CharacterProfileProps = {
  level: number;
};

export function CharacterProfile({ level }: CharacterProfileProps) {
  const currentCharacter =
    CHARACTER_LEVELS.find((c) => c.level === level) || CHARACTER_LEVELS[0];

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
      <div className="relative w-24 h-24 bg-[#7C9885]/10 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C9885]/5 to-transparent" />

        <Image
          src={currentCharacter.imageUrl}
          alt={currentCharacter.name}
          width={240}
          height={240}
          priority
          className="object-contain relative z-10 "
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black tracking-wider text-[#7C9885] bg-[#7C9885]/10 px-2 py-0.5 rounded-full uppercase">
            Lv.{level}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
          {currentCharacter.name}
        </h2>
        <p className="text-sm text-gray-500 mt-1 leading-snug break-keep">
          {currentCharacter.description}
        </p>
      </div>
    </section>
  );
}
