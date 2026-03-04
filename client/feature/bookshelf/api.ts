import { api } from "@/lib/api";
import type { BookshelfItem, BookStatus, UpdateBookshelfRequest } from "./type";

export const bookshelfApi = {
  addBook: (body: {
    isbn: string;
    title: string;
    author: string;
    imageUrl: string;
    description: string;
    status: BookStatus;
  }): Promise<BookshelfItem> => {
    return api.post("/bookshelf", body);
  },

  getMyBooks: (): Promise<BookshelfItem[]> => {
    return api.get("/bookshelf");
  },

  getBookshelfItem: (id: number): Promise<BookshelfItem> => {
    return api.get(`/bookshelf/${id}`);
  },

  updateBookshelfItem: (
    id: number,
    body: UpdateBookshelfRequest
  ): Promise<BookshelfItem> => {
    return api.patch(`/bookshelf/${id}`, body);
  },
};
