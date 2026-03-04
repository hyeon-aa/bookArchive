export const bookKeys = {
  all: ["books"] as const,
  search: (query: string) => [...bookKeys.all, "search", query] as const,
};
