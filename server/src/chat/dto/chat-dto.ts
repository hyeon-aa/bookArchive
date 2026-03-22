export class ChatMessageDto {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}
