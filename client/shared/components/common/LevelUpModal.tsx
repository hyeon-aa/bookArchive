import { CHARACTER_LEVELS } from "@/shared/constants/character_level";
import { useModal } from "@/shared/hooks/useModal";
import Image from "next/image";

type LevelUpModalProps = {
  level: number;
  onNext: () => void;
};

export function LevelUpModal({ level, onNext }: LevelUpModalProps) {
  const { close } = useModal();

  const currentLevelData =
    CHARACTER_LEVELS.find((c) => c.level === level) || CHARACTER_LEVELS[0];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="relative mx-auto w-32 h-32 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#7C9885]/10 rounded-full animate-pulse" />

          <Image
            src={currentLevelData.imageUrl}
            alt={currentLevelData.name}
            width={128}
            height={128}
            className="object-contain relative z-10 p-2"
          />
        </div>

        <p className="text-[#7C9885] font-extrabold text-lg mb-1">
          {currentLevelData.name}
        </p>

        <h2 className="text-2xl font-bold mb-2 text-gray-800 tracking-tight">
          Level Up!
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          벌써 많은 책을 읽으셨네요! <br />
          새로운 등급{" "}
          <span className="text-[#7C9885] font-bold">Lv.{level}</span>가
          되셨습니다.
        </p>

        <button
          onClick={() => {
            close();
            onNext();
          }}
          className="w-full py-4 bg-[#7C9885] hover:bg-[#6b8574] transition-colors text-white rounded-2xl font-bold shadow-lg shadow-[#7C9885]/20"
        >
          확인
        </button>
      </div>
    </div>
  );
}
