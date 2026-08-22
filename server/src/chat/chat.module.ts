import { Module } from '@nestjs/common';
import { AiModule } from 'src/ai/ai.module';
import { BooksModule } from 'src/books/books.module';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RecommendationLogModule } from 'src/recommendation-log/recommendation-log.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RecommendationIntentService } from './recommendation-intent.service';

@Module({
  imports: [
    AiModule,
    EmbeddingModule,
    PrismaModule,
    BooksModule,
    RecommendationLogModule,
  ],
  providers: [ChatService, RecommendationIntentService],
  controllers: [ChatController],
})
export class ChatModule {}
