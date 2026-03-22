import { Module } from '@nestjs/common';
import { AiModule } from 'src/ai/ai.module';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AiModule, EmbeddingModule, PrismaModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
