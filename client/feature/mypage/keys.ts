export const myPageKeys = {
  all: ["mypage"] as const,
  phrases: () => [...myPageKeys.all, "phrases"] as const,
  tags: () => [...myPageKeys.all, "tagss"] as const,
};
