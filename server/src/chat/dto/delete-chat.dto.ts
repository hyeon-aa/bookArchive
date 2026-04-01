import { IsArray, IsInt } from 'class-validator';

export class DeleteChatDto {
  @IsArray()
  @IsInt({ each: true })
  chatIds: number[];
}
