export const exploreKeys = {
  all: ["explore"] as const,
  quote: () => [...exploreKeys.all, "quote"] as const,
  taste: () => [...exploreKeys.all, "taste"] as const,
  aireport: () => [...exploreKeys.all, "aireport"] as const,
};
