export class BookResponseDto {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
}

export class BookshelfResponseDto {
  id: number;
  status: string;
  createdAt: Date;
  book: BookResponseDto;
}

export class BookshelfWithLevelResponseDto extends BookshelfResponseDto {
  isLevelUp: boolean;
  currentCount: number;
  newLevel?: number;
}

export interface SimilarBookResult {
  title: string;
  author: string;
}
