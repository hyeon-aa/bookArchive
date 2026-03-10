import { IsArray, IsInt } from 'class-validator';

export class DeleteBookshelfDto {
  @IsArray()
  @IsInt({ each: true })
  bookshelfIds: number[];
}
