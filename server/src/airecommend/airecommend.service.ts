import { Injectable } from '@nestjs/common';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { BooksService } from '../books/books.service';
import { BookshelfService } from '../bookshelf/bookshelf.service';
import {
  AiRecommendRequestDto,
  AiReportResponseDto,
  AITasteRecommendResponseDto,
  DailyQuoteResponseDto,
} from './dto/ai-recommend.dto';
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
    private readonly aiService: AiService,
    private readonly booksService: BooksService,
    private readonly bookshelfService: BookshelfService,
    private readonly embeddingService: EmbeddingService,
    private readonly prisma: PrismaService,
  ) {}

  async recommend(
    dto: AiRecommendRequestDto,
  ): Promise<{ reason: string; books: BookItem[] }> {
    try {
      // 1. 기분/고민을 벡터화해서, 미리 시딩해둔 공용 풀에서 실존하는 후보를 직접 검색
      // (LLM에게 책을 자유 생성시키지 않음 — 후보에 없는 책은 애초에 나올 수 없음)
      const queryVector = await this.embeddingService.createEmbedding(
        `${dto.currentMood} ${dto.userTalk}`,
      );
      const candidates = await this.booksService.searchByVector(
        JSON.stringify(queryVector),
        8,
      );

      if (candidates.length === 0) {
        return {
          reason: '아직 추천할 만한 책 데이터가 충분하지 않아요.',
          books: [],
        };
      }

      // 2. LLM에게는 후보 중에서 고르고 이유만 설명하게 함
      const aiDraft = await this.aiService.generateBookRecommendations(
        dto.currentMood,
        dto.userTalk,
        candidates,
      );

      // 3. LLM이 고른 제목을 후보 목록과 대조해 완전한 책 정보로 복원
      // (이미 검증된 DB 데이터라 네이버로 다시 검증할 필요가 없음)
      const results = aiDraft.books
        .map((picked) =>
          candidates.find((candidate) => candidate.title === picked.title),
        )
        .filter((book): book is BookItem => book !== undefined);

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
      const myBooks = await this.bookshelfService.getMyBooks(userId);

      if (!myBooks || myBooks.length === 0) {
        return {
          tasteSummary: '서재에 책을 담아주시면 취향을 분석해 드릴게요!',
          familiarBooks: [],
          challengeBooks: [],
        };
      }

      // 2. 벡터 검색으로 유사한 책들 미리 가져오기 (공용 풀 대상 RAG 방식)
      const similarBooks = await this.bookshelfService.getSimilarBooks(
        userId,
        8,
      );

      // AI에게 전달할 형식으로 변환
      const formattedBooks = myBooks.map((item) => ({
        title: item.book.title,
        author: item.book.author,
        status: item.status || '읽기 전',
      }));

      // 3. AI에게 추천 요청 (similarBooks 후보 중에서만 고르도록 프롬프트로 제약)
      const aiResult = await this.aiService.generateTasteBasedRecommendations(
        formattedBooks,
        similarBooks,
      );

      // 후보 목록에 이미 isbn·설명·이미지가 다 있으므로, LLM이 고른 제목을
      // 후보와 대조하기만 하면 됨 — 네이버 재검증이 필요 없음.
      const resolveBooks = (
        books: AIResponseBook[],
      ): FinalRecommendedBook[] => {
        if (!books || !Array.isArray(books)) return [];

        return books
          .map((aiBook) => {
            const matched = similarBooks.find(
              (candidate) => candidate.title === aiBook.title,
            );
            if (!matched) {
              console.warn(
                `[필터링] 후보 목록에 없는 도서 제외: ${aiBook.title}`,
              );
              return null;
            }
            return { book: matched, reason: aiBook.reason };
          })
          .filter((item): item is FinalRecommendedBook => item !== null);
      };

      return {
        tasteSummary:
          aiResult?.tasteSummary || '당신의 독서 취향을 분석한 결과입니다.',
        familiarBooks: resolveBooks(aiResult?.familiarBooks),
        challengeBooks: resolveBooks(aiResult?.challengeBooks),
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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const result = await this.prisma.bookshelf.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
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
