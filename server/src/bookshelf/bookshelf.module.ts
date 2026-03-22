import { Module } from '@nestjs/common';
import { AiModule } from 'src/ai/ai.module';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { BookshelfController } from './bookshelf.controller';
import { BookshelfService } from './bookshelf.service';

@Module({
  imports: [AiModule, EmbeddingModule],
  controllers: [BookshelfController],
  providers: [BookshelfService],
  exports: [BookshelfService],
})
export class BookshelfModule {}
