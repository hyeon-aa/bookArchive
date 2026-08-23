import { Injectable } from '@nestjs/common';
import { SimilarBookResult } from 'src/bookshelf/dto/bookshelf-response.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecommendationLogService } from 'src/recommendation-log/recommendation-log.service';
import { AiService } from '../ai/ai.service';
import { BooksService } from '../books/books.service';
import { BookshelfService } from '../bookshelf/bookshelf.service';
import {
  getCategoriesForMood,
  getMoodGroupLabel,
} from './constants/mood-category-map';
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
    id: number;
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
    private readonly recommendationLogService: RecommendationLogService,
  ) {}

  async recommend(
    dto: AiRecommendRequestDto,
    userId?: number,
  ): Promise<{ reason: string; books: BookItem[] }> {
    try {
      // 1. 기분/고민을 벡터화해서, 미리 시딩해둔 공용 풀에서 실존하는 후보를 직접 검색
      // (LLM에게 책을 자유 생성시키지 않음 — 후보에 없는 책은 애초에 나올 수 없음)
      const queryVector = await this.embeddingService.createEmbedding(
        `${dto.currentMood} ${dto.userTalk}`,
      );
      const vectorStr = JSON.stringify(queryVector);

      // 무드에 맞는 장르로 먼저 좁혀서 검색 (하이브리드: 벡터 유사도 + 장르 필터).
      // 매핑에 없는 무드거나, 필터링했더니 후보가 없으면 장르 필터 없이 재검색.
      const moodCategories = getCategoriesForMood(dto.currentMood);
      let candidates = await this.booksService.searchByVector(
        vectorStr,
        8,
        moodCategories,
      );
      if (candidates.length === 0 && moodCategories.length > 0) {
        candidates = await this.booksService.searchByVector(vectorStr, 8);
      }

      if (candidates.length === 0) {
        return {
          reason: '아직 추천할 만한 책 데이터가 충분하지 않아요.',
          books: [],
        };
      }

      // 2. LLM에게는 후보 중에서 고르고 이유만 설명하게 함. 프롬프트의
      // [분석 규칙]이 무드 "그룹"(예: 불안/슬픔) 기준으로 분기하므로, 원본
      // 형용사("막막한")뿐 아니라 그룹 라벨도 같이 넘겨서 LLM이 스스로
      // 형용사→그룹을 추측하지 않아도 되게 한다.
      const moodGroupLabel = getMoodGroupLabel(dto.currentMood);
      // LLM 판단엔 title/author/description만 필요 — id·isbn·imageUrl·category
      // 까지 그대로 넘기면 프롬프트에 불필요한 필드가 섞여 토큰만 낭비된다.
      const promptCandidates = candidates.map((c) => ({
        title: c.title,
        author: c.author,
        description: c.description,
      }));
      const aiDraft = await this.aiService.generateBookRecommendations(
        dto.currentMood,
        moodGroupLabel,
        dto.userTalk,
        promptCandidates,
      );

      // 3. LLM이 고른 제목을 후보 목록과 대조해 완전한 책 정보로 복원
      // (이미 검증된 DB 데이터라 네이버로 다시 검증할 필요가 없음)
      const results = aiDraft.books
        .map((picked) =>
          candidates.find((candidate) => candidate.title === picked.title),
        )
        .filter((book): book is BookItem => book !== undefined);

      // 실제로 사용자에게 노출된 최종 추천만 기록(비로그인 요청은 userId 없이,
      // 전환율 집계에서는 제외됨 — RecommendationLogService 참고)
      await this.recommendationLogService.logShown(
        userId,
        results.map((book) => book.id),
        'mood',
      );

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

      // 2. 후보를 두 갈래로 나눠서 검색 (공용 풀 대상 RAG 방식).
      // familiar/challenge를 같은 풀에서 뽑으면 challenge도 결국 취향과
      // 가장 가까운(=가장 안 새로운) 책이 나오는 문제가 있어서, challenge는
      // 사용자가 안 읽은 장르로 코드 레벨에서 미리 걸러둔다.
      const [familiarCandidates, challengeCandidates] = await Promise.all([
        this.bookshelfService.getSimilarBooks(userId, 5),
        this.bookshelfService.getChallengeBooks(userId, 5),
      ]);

      // AI에게 전달할 형식으로 변환
      const formattedBooks = myBooks.map((item) => ({
        title: item.book.title,
        author: item.book.author,
        status: item.status || '읽기 전',
      }));

      // 3. AI에게 추천 요청 (각 필드는 그 필드에 대응하는 후보 목록 안에서만 고르도록 프롬프트로 제약).
      // 여기도 LLM 판단엔 title/author/description만 필요해서 나머지 필드는 잘라낸다.
      const toPromptCandidate = (c: SimilarBookResult) => ({
        title: c.title,
        author: c.author,
        description: c.description,
      });
      const aiResult = await this.aiService.generateTasteBasedRecommendations(
        formattedBooks,
        familiarCandidates.map(toPromptCandidate),
        challengeCandidates.map(toPromptCandidate),
      );

      // 후보 목록에 이미 isbn·설명·이미지가 다 있으므로, LLM이 고른 제목을
      // 후보와 대조하기만 하면 됨 — 네이버 재검증이 필요 없음.
      const resolveBooks = (
        books: AIResponseBook[],
        candidates: SimilarBookResult[],
      ): FinalRecommendedBook[] => {
        if (!books || !Array.isArray(books)) return [];

        return books
          .map((aiBook) => {
            const matched = candidates.find(
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

      const familiarBooks = resolveBooks(
        aiResult?.familiarBooks,
        familiarCandidates,
      );
      const challengeBooks = resolveBooks(
        aiResult?.challengeBooks,
        challengeCandidates,
      );

      await this.recommendationLogService.logShown(
        userId,
        [...familiarBooks, ...challengeBooks].map((item) => item.book.id),
        'taste',
      );

      return {
        tasteSummary:
          aiResult?.tasteSummary || '당신의 독서 취향을 분석한 결과입니다.',
        familiarBooks,
        challengeBooks,
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
