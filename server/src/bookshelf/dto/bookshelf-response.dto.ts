export class BookResponseDto {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
}

export class BookshelfResponseDto {
  id: number;
  status: string;
  createdAt: Date;
  book: BookResponseDto;
}
