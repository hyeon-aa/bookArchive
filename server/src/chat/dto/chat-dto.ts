import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsInt()
  roomId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
