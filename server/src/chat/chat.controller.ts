import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-dto';
import { DeleteChatDto } from './dto/delete-chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async chat(
    @CurrentUser('userId') userId: number,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.service.streamChat(userId, dto, res);
  }

  @Get('rooms')
  getRooms(@CurrentUser('userId') userId: number) {
    return this.service.getRooms(userId);
  }

  @Post('rooms')
  createRooms(@CurrentUser('userId') userId: number) {
    return this.service.createRooms(userId);
  }

  @Get('rooms/:roomId')
  getChatRoomItem(
    @CurrentUser('userId') userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.service.getChatRoomItem(userId, roomId);
  }

  @Delete('batch')
  async deleteChats(
    @CurrentUser('userId') userId: number,
    @Body() dto: DeleteChatDto,
  ) {
    return await this.service.deleteChats(userId, dto.chatIds);
  }
}
