import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AiModule } from 'src/ai/ai.module';
import { BookshelfModule } from 'src/bookshelf/bookshelf.module';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { RecommendationLogModule } from 'src/recommendation-log/recommendation-log.module';
import { BooksModule } from '../books/books.module';
import { AirecommendController } from './airecommend.controller';
import { AirecommendService } from './airecommend.service';

@Module({
  imports: [
    HttpModule,
    BooksModule,
    BookshelfModule,
    AiModule,
    BookshelfModule,
    BooksModule,
    EmbeddingModule,
    RecommendationLogModule,
  ],
  controllers: [AirecommendController],
  providers: [AirecommendService],
})
export class AirecommendModule {}
