import { api } from "@/lib/api";
import { BookSearchResponse } from "./type";

export const bookSearchApi = {
  search: async (query: string, start: number = 1) => {
    const data = await api.get<BookSearchResponse[]>("/books/search", {
      params: { query, start },
    });

    return data;
  },
};
