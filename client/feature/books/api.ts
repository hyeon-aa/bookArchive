import { apiFetch } from "@/lib/api";
import { BookSearch } from "./type";

export const bookSearchApi = {
  search: async (query: string): Promise<BookSearch[]> => {
    return apiFetch(`/books/search?query=${encodeURIComponent(query)}`);
  },
};
