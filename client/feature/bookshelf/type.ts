export type BookStatus = "READING" | "DONE" | "BEFORE";

export interface UpdateBookshelfRequest {
  status?: BookStatus;
  comment?: string;
  emotion?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
}

export interface BookItem {
  id: number;
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
}

export interface BookshelfItemResponse {
  id: number;
  status: BookStatus;
  createdAt: string;
  comment?: string | null;
  emotion?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  aiTags?: string[] | null;
  aiComment?: string | null;
  book: BookItem;
}
