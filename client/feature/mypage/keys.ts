export const myPageKeys = {
  all: ["mypage"] as const,
  phrases: () => [...myPageKeys.all, "phrases"] as const,
  tags: () => [...myPageKeys.all, "tags"] as const,
  timeline: () => [...myPageKeys.all, "timeline"] as const,
};
