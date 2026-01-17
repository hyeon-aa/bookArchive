import { IsEnum } from 'class-validator';

export class AddBookDto {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;

  @IsEnum(['BEFORE', 'READING', 'DONE'])
  status: 'BEFORE' | 'READING' | 'DONE';
}
