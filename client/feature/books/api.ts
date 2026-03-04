import { api } from "@/lib/api";
import { BookSearch } from "./type";

export const bookSearchApi = {
  search: (query: string, start: number = 1): Promise<BookSearch[]> => {
    return api.get("/books/search", {
      params: { query, start },
    });
  },
};
