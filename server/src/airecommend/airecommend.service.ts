import { Injectable } from '@nestjs/common';
import { aiService } from '../ai/ai.service';
import { BooksService } from '../books/books.service';
import { BookshelfService } from '../bookshelf/bookshelf.service';
import {
  AiRecommendRequestDto,
  AITasteRecommendResponseDto,
  DailyQuoteResponseDto,
  RecommendedBookDto,
} from './dto/ai-recommend.dto';
import { AIRecommendDraft } from './types/ai-recommend.type';
import { BookItem } from './types/book-item.type';

@Injectable()
export class AirecommendService {
  constructor(
    private readonly aiService: aiService,
    private readonly booksService: BooksService,
    private readonly BookShelfService: BookshelfService,
  ) {}
  async recommend(
    dto: AiRecommendRequestDto,
  ): Promise<{ reason: string; books: BookItem[] }> {
    try {
      /** 1. AI에게 추천 이유와 책 리스트 초안 물어보기 */
      const aiDraft: AIRecommendDraft =
        await this.aiService.generateBookRecommendations(
          dto.currentMood,
          dto.userTalk,
        );

      const results: BookItem[] = [];

      for (const book of aiDraft.books) {
        const query = `${book.title}`.trim();
        const searchResult = await this.booksService.search(query);

        if (searchResult && searchResult.length > 0) {
          results.push(searchResult[0]);
        }
      }

      return {
        reason: aiDraft.reason,
        books: results,
      };
    } catch (error) {
      console.error('[Recommend Error]', error);
      return {
        reason: '추천 도서를 불러오는 중에 문제가 발생했습니다.',
        books: [],
      };
    }
  }
  /** 2. AI에게 오늘의 책 속 문장 하나 요청 */
  async getDailyQuote(): Promise<DailyQuoteResponseDto> {
    try {
      return await this.aiService.generateDailyQuote();
    } catch (error) {
      console.error('[Daily Quote Service Error]', error);
      throw error;
    }
  }
  /** 3. AI에게 내 책장을 기준으로 책 추천 받기 -> 내 취향에 맞는 책과 새로운 장르 */
  async getTasteRecommendations(
    userId: number,
  ): Promise<AITasteRecommendResponseDto> {
    try {
      const myBooks = await this.BookShelfService.getMyBooks(userId);

      if (!myBooks || myBooks.length === 0) {
        return {
          tasteSummary: '서재에 책을 담아주시면 취향을 분석해 드릴게요!',
          familiarBooks: [],
          challengeBooks: [],
        };
      }
      const formattedBooks = myBooks.map((item) => ({
        title: item.book.title,
        author: item.book.author,
        status: item.status || '읽기 전',
      }));

      /** 1. AI 추천 초안 */
      const aiResult =
        await this.aiService.generateTasteBasedRecommendations(formattedBooks);

      /** 2. 실제 BookItem으로 보정 */
      const resolveBooks = async (
        books: { title: string; reason: string }[],
      ): Promise<RecommendedBookDto[]> => {
        const results: RecommendedBookDto[] = [];

        for (const book of books) {
          const searchResult = await this.booksService.search(book.title);

          if (searchResult && searchResult.length > 0) {
            results.push({
              book: searchResult[0],
              reason: book.reason,
            });
          }
        }

        return results;
      };

      return {
        tasteSummary: aiResult.tasteSummary,
        familiarBooks: await resolveBooks(aiResult.familiarBooks),
        challengeBooks: await resolveBooks(aiResult.challengeBooks),
      };
    } catch (error) {
      console.error('[Taste Recommend Error]', error);
      return {
        tasteSummary: '취향 분석 중 오류가 발생했습니다.',
        familiarBooks: [],
        challengeBooks: [],
      };
    }
  }
}
