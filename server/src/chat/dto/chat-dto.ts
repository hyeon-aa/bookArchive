export class ChatMessageDto {
  roomId: number;
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}
