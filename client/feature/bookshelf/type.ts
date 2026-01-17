export type BookStatus = "READING" | "DONE" | "BEFORE";

export interface BookshelfItem {
  id: number;
  status: BookStatus;
  createdAt: string;

  book: {
    id: number;
    isbn: string;
    title: string;
    author: string;
    imageUrl: string;
  };
}
