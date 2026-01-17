import { IsNotEmpty, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class SearchResponseDto {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
}
