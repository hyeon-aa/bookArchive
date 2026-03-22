import { Module } from '@nestjs/common';
import { AiModule } from 'src/ai/ai.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AiModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
