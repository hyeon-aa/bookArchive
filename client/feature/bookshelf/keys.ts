export const bookshelfKeys = {
  all: ["bookshelf"] as const,
  lists: () => [...bookshelfKeys.all, "list"] as const,
  detail: (id: number) => [...bookshelfKeys.all, "detail", id] as const,
};
