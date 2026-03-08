import { api } from "@/lib/api";
import type {
  BookshelfItemResponse,
  BookStatus,
  UpdateBookshelfRequest,
} from "./type";

export const bookshelfApi = {
  addBook: async (body: {
    isbn: string;
    title: string;
    author: string;
    imageUrl: string;
    description: string;
    status: BookStatus;
  }) => {
    const data = await api.post<BookshelfItemResponse>("/bookshelf", body);
    return data;
  },

  getMyBooks: async () => {
    const data = await api.get<BookshelfItemResponse[]>("/bookshelf");
    return data;
  },

  getBookshelfItem: async (id: number) => {
    const data = await api.get<BookshelfItemResponse>(`/bookshelf/${id}`);
    return data;
  },

  updateBookshelfItem: async (id: number, body: UpdateBookshelfRequest) => {
    const data = await api.patch<BookshelfItemResponse>(
      `/bookshelf/${id}`,
      body
    );
    return data;
  },
};
