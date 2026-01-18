import { Module } from '@nestjs/common';
import { aiService } from 'src/ai/ai.service';
import { BookshelfController } from './bookshelf.controller';
import { BookshelfService } from './bookshelf.service';

@Module({
  controllers: [BookshelfController],
  providers: [BookshelfService, aiService],
})
export class BookshelfModule {}
