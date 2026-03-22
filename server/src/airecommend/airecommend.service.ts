import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { aiService } from '../ai/ai.service';
import { BooksService } from '../books/books.service';
import { BookshelfService } from '../bookshelf/bookshelf.service';
import {
  AiRecommendRequestDto,
  AiReportResponseDto,
  AITasteRecommendResponseDto,
  DailyQuoteResponseDto,
} from './dto/ai-recommend.dto';
import { AIRecommendDraft } from './types/ai-recommend.type';
import { BookItem } from './types/book-item.type';

interface AIResponseBook {
  title: string;
  reason: string;
}

interface FinalRecommendedBook {
  book: {
    isbn: string;
    title: string;
    author: string;
    imageUrl: string;
    description: string;
  };
  reason: string;
}

@Injectable()
export class AirecommendService {
  constructor(
    private readonly aiService: aiService,
    private readonly booksService: BooksService,
    private readonly BookShelfService: BookshelfService,
    private readonly prisma: PrismaService,
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

  async getTasteRecommendations(
    userId: number,
  ): Promise<AITasteRecommendResponseDto> {
    try {
      // 1. 내 서재 데이터 가져오기
      const myBooks = await this.BookShelfService.getMyBooks(userId);

      if (!myBooks || myBooks.length === 0) {
        return {
          tasteSummary: '서재에 책을 담아주시면 취향을 분석해 드릴게요!',
          familiarBooks: [],
          challengeBooks: [],
        };
      }

      // 2. 벡터 검색으로 유사한 책들 미리 가져오기 (RAG 방식)
      const similarBooks = await this.BookShelfService.getSimilarBooks(
        userId,
        5,
      );

      // AI에게 전달할 형식으로 변환
      const formattedBooks = myBooks.map((item) => ({
        title: item.book.title,
        author: item.book.author,
        status: item.status || '읽기 전',
      }));

      // 3. AI에게 추천 요청
      const aiResult = await this.aiService.generateTasteBasedRecommendations(
        formattedBooks,
        similarBooks,
      );

      const resolveBooks = async (
        books: AIResponseBook[],
      ): Promise<FinalRecommendedBook[]> => {
        if (!books || !Array.isArray(books)) return [];

        const results: FinalRecommendedBook[] = [];

        for (const aiBook of books) {
          try {
            const searchResults = await this.booksService.search(aiBook.title);

            if (searchResults && searchResults.length > 0) {
              const realBook = searchResults[0];

              results.push({
                book: {
                  isbn: realBook.isbn,
                  title: realBook.title,
                  author: realBook.author,
                  imageUrl: realBook.imageUrl,
                  description: realBook.description,
                },
                reason: aiBook.reason,
              });
            } else {
              console.warn(`[필터링] 실존하지 않는 도서 제외: ${aiBook.title}`);
            }
          } catch (error) {
            console.error(`네이버 검색 연동 중 오류: ${aiBook.title}`, error);
          }
        }

        return results;
      };

      return {
        tasteSummary:
          aiResult?.tasteSummary || '당신의 독서 취향을 분석한 결과입니다.',
        familiarBooks: await resolveBooks(aiResult?.familiarBooks),
        challengeBooks: await resolveBooks(aiResult?.challengeBooks),
      };
    } catch (error) {
      console.error('[Taste Recommend Error]', error);
      return {
        tasteSummary: '취향 분석 도중 일시적인 오류가 발생했습니다.',
        familiarBooks: [],
        challengeBooks: [],
      };
    }
  }

  async getAIReport(userId: number): Promise<AiReportResponseDto> {
    const result = await this.prisma.bookshelf.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        phrase: true,
        emotion: true,
        intent: true,
        sub: true,
        book: {
          select: {
            title: true,
            description: true,
            author: true,
          },
        },
      },
    });

    const myBooks = result.map((item) => ({
      title: item.book.title,
      description: item.book.description,
      author: item.book.author,
      phrase: item.phrase,
      emotion: item.emotion,
      intent: item.intent,
      sub: item.sub,
    }));

    try {
      return await this.aiService.generateAIBookReport({ books: myBooks });
    } catch (error) {
      console.error('[AI Report Service Error]', error);
      throw error;
    }
  }
}
