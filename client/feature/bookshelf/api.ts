// feature/bookshelf/api.ts
import { apiFetch } from "@/lib/api";
import type { BookStatus } from "./type";

export const bookshelfApi = {
  addBook: (body: {
    isbn: string;
    title: string;
    author: string;
    imageUrl: string;
    status: BookStatus;
  }) => {
    return apiFetch("/bookshelf", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },

  getMyBooks: () => {
    return apiFetch("/bookshelf", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },
};
