import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  start: number = 1;
}

export class SearchResponseDto {
  id?: number; // 알라딘 실시간 키워드 검색(search) 결과는 아직 DB에 없어 undefined
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
  category?: string;
}
