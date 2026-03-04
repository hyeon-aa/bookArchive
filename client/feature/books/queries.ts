import { useQuery } from "@tanstack/react-query";
import { bookSearchApi } from "./api";
import { bookKeys } from "./keys";

export const useBookSearch = (query: string) => {
  return useQuery({
    queryKey: bookKeys.search(query),
    queryFn: () => bookSearchApi.search(query),
    enabled: query.trim().length > 0,
  });
};
