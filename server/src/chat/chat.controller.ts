import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @CurrentUser('userId') userId: number,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.chatService.streamChat(userId, dto, res);
  }
}
