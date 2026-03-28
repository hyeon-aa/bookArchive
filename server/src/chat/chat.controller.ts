import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
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

  @Get('rooms')
  getRooms(@CurrentUser('userId') userId: number) {
    return this.chatService.getRooms(userId);
  }

  @Post('rooms')
  createRooms(@CurrentUser('userId') userId: number) {
    return this.chatService.createRooms(userId);
  }

  @Get('rooms/:roomId')
  getChatRoomItem(
    @CurrentUser('userId') userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.chatService.getChatRoomItem(userId, roomId);
  }
}
