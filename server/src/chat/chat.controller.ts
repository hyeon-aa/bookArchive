import { Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Res() res: Response): Promise<void> {
    await this.chatService.streamChat(res);
  }
}
