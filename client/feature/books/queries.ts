import { useInfiniteQuery } from "@tanstack/react-query";
import { bookSearchApi } from "./api";
import { bookKeys } from "./keys";

export const useBookInfiniteSearch = (query: string) => {
  const trimmedQuery = query.trim();

  return useInfiniteQuery({
    queryKey: bookKeys.search(trimmedQuery),
    queryFn: ({ pageParam = 1 }) =>
      bookSearchApi.search(trimmedQuery, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length * 10 + 1;
    },
    enabled: false,
  });
};
