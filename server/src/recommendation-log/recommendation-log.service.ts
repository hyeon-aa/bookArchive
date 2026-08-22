import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type RecommendationSource = 'mood' | 'taste' | 'chat';

@Injectable()
export class RecommendationLogService {
  constructor(private readonly prisma: PrismaService) {}

  // 추천 화면에 실제로 노출된 책을 기록. 나중에 Bookshelf와 대조해서
  // "추천 → 책장 담기" 전환율을 계산하는 용도(recommendation-stats 스크립트).
  // 로깅 실패가 추천 응답 자체를 막으면 안 되므로 에러를 삼킨다.
  async logShown(
    userId: number | undefined | null,
    bookIds: number[],
    source: RecommendationSource,
  ): Promise<void> {
    if (bookIds.length === 0) return;

    try {
      await this.prisma.recommendationLog.createMany({
        data: bookIds.map((bookId) => ({
          userId: userId ?? null,
          bookId,
          source,
        })),
      });
    } catch (error) {
      console.error('[RecommendationLog Error]', error);
    }
  }
}
