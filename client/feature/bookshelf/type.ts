export type BookStatus = "READING" | "DONE" | "BEFORE";

export interface BookshelfItem {
  id: number;
  status: BookStatus;
  createdAt: string;
  comment?: string | null;
  emotion?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  aiTags?: string[] | null;
  aicomment?: string | null;

  book: {
    id: number;
    isbn: string;
    title: string;
    author: string;
    imageUrl: string;
  };
}
