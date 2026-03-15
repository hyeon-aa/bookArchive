import { BookStatus } from '@prisma/client';

export class BookInfoDto {
  id: number;
  title: string;
  imageUrl: string;
  author: string;
}

export class MyPhraseResponseDto {
  id: number;
  phrase: string;
  comment: string;
  emotion: string;
  status: BookStatus;
  createdAt: Date;
  book: BookInfoDto;
}
