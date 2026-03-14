export const CHARACTER_LEVELS = [
  {
    level: 1,
    name: "호기심 많은 새싹",
    description: "책의 세계에 첫 발을 내디뎠어요!",
    imageUrl: "/images/level1.webp",
  },
  {
    level: 2,
    name: "꿈꾸는 잎사귀",
    description: "책 속의 마법을 발견하기 시작했어요.",
    imageUrl: "/images/level2.webp",
  },
  {
    level: 3,
    name: "진리를 찾는 탐구자",
    description: "돋보기 너머로 책 속에 숨겨진 마법과 진리를 찾아내요.",
    imageUrl: "/images/level3.webp",
  },
] as const;

export type CharacterLevel = (typeof CHARACTER_LEVELS)[number];
