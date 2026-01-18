import { apiFetch } from "@/lib/api";
import type { BookshelfItem, BookStatus } from "./type";

export const bookshelfApi = {
  /* 책 검색 후 등록하기 */
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

  /* 내 책장 조회하기 */
  getMyBooks: () => {
    return apiFetch("/bookshelf", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },

  /* 내 책장 조회 후 책 상세 조회(한출평,시작/종료일,감정)*/
  getBookshelfItem(id: number): Promise<BookshelfItem> {
    return apiFetch(`/bookshelf/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },

  /*한줄평,시작/종료일,감정 입력 -> ai 한줄평,태그 생성되면 저장*/
  updateBookshelfItem: (
    id: number,
    body: {
      status: BookStatus;
      comment?: string;
      emotion?: string;
      startDate?: string;
      endDate?: string;
      title?: string;
    }
  ) => {
    return apiFetch(`/bookshelf/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },
};
