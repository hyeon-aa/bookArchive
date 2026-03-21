import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BooksService } from 'src/books/books.service';
import { BookshelfModule } from 'src/bookshelf/bookshelf.module';
import { BookshelfService } from 'src/bookshelf/bookshelf.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { aiService } from '../ai/ai.service';
import { BooksModule } from '../books/books.module';
import { AirecommendController } from './airecommend.controller';
import { AirecommendService } from './airecommend.service';

@Module({
  imports: [HttpModule, BooksModule, BookshelfModule, PrismaModule],
  controllers: [AirecommendController],
  providers: [
    AirecommendService,
    aiService,
    BookshelfService,
    BooksService,
    EmbeddingService,
  ],
})
export class AirecommendModule {}
