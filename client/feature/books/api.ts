import { api } from "@/lib/api";
import { BookSearch } from "./type";

export const bookSearchApi = {
  search: async (query: string): Promise<BookSearch[]> => {
    return api(`/books/search?query=${encodeURIComponent(query)}`);
  },
};
