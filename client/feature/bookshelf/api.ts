import { api } from "@/lib/api";
import type {
  BookshelfItemResponse,
  BookshelfItemWithLevelResponse,
  BookStatus,
  DeleteBookshelfResponse,
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
    const data = await api.post<BookshelfItemWithLevelResponse>(
      "/bookshelf",
      body
    );
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
    const data = await api.patch<BookshelfItemWithLevelResponse>(
      `/bookshelf/${id}`,
      body
    );
    return data;
  },

  deleteBooks: async (bookshelfIds: number[]) => {
    const data = await api.delete<DeleteBookshelfResponse>("/bookshelf/batch", {
      bookshelfIds,
    });
    return data;
  },
};
