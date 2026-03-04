import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @Type(() => Number)
  start?: number = 1;
}

export class SearchResponseDto {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
}
