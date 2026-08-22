import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class AddBookDto {
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(['BEFORE', 'READING', 'DONE'])
  status: 'BEFORE' | 'READING' | 'DONE';
}
