import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AiService } from 'src/ai/ai.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AITagResponseDto } from '../ai/dto/ai-response.dto';
import { AddBookDto } from './dto/add-book.dto';
import {
  BookshelfResponseDto,
  BookshelfWithLevelResponseDto,
  SimilarBookResult,
} from './dto/bookshelf-response.dto';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

@Injectable()
export class BookshelfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  private async checkLevelUp(userId: number) {
    const totalDoneCount = await this.prisma.bookshelf.count({
      where: { userId, status: 'DONE' },
    });

    const targetLevel =
      totalDoneCount >= 100
        ? 5
        : totalDoneCount >= 50
          ? 4
          : totalDoneCount >= 30
            ? 3
            : totalDoneCount >= 10
              ? 2
              : 1;

    if (targetLevel === 1) {
      return {
        isLevelUp: false,
        currentCount: totalDoneCount,
        newLevel: undefined,
      };
    }

    //lt: < => 유저 테이블에서 id가 일치하고, 현재 level이 targetLevel보다 작은(level < targetLevel) 데이터만 고르기
    const { count: promoted } = await this.prisma.user.updateMany({
      where: {
        id: userId,
        level: { lt: targetLevel },
      },
      // 찾은 대상의 level 칸에 새 레벨을 적기
      data: { level: targetLevel },
    });

    const isLevelUp = promoted > 0;

    return {
      isLevelUp,
      currentCount: totalDoneCount,
      newLevel: isLevelUp ? targetLevel : undefined,
    };
  }

  async addBook(
    userId: number,
    dto: AddBookDto,
  ): Promise<BookshelfWithLevelResponseDto> {
    // 1. 책 존재 여부 확인
    let book = await this.prisma.book.findUnique({
      where: { isbn: dto.isbn },
    });

    // 책이 없으면 생성
    if (!book) {
      book = await this.prisma.book.create({
        data: {
          isbn: dto.isbn,
          title: dto.title,
          author: dto.author,
          imageUrl: dto.imageUrl,
          description: dto.description,
        },
      });
    }

    // 책은 이미 있어도 '임베딩'이 없는 경우가 있으므로 체크 로직 분리
    const existingEmbedding = await this.prisma.$queryRaw`
      SELECT id FROM "BookEmbedding" WHERE "bookId" = ${book.id}
    `;

    if (!Array.isArray(existingEmbedding) || existingEmbedding.length === 0) {
      // 제목/저자는 이미 Book 테이블에 구조화된 컬럼으로 있으니 임베딩엔 안 섞고,
      // 의미 있는 내용이 담긴 description 위주로 임베딩. description이 없는 경우만
      // 제목/저자로 폴백해서 최소한의 벡터는 만들어둠.
      const textToEmbed = book.description?.trim()
        ? book.description
        : `${book.title} ${book.author}`;

      try {
        const embedding =
          await this.embeddingService.createEmbedding(textToEmbed);

        await this.prisma.$executeRaw`
          INSERT INTO "BookEmbedding" ("bookId", "embedding")
          VALUES (${book.id}, ${JSON.stringify(embedding)}::vector)
          ON CONFLICT ("bookId") DO NOTHING
        `;
        console.log(`${book.title} 임베딩 저장 성공`);
      } catch (error) {
        console.error('임베딩 생성 중 오류 발생:', error);
      }
    }

    const bookshelf = await this.prisma.bookshelf.upsert({
      where: {
        userId_bookId: { userId, bookId: book.id },
      },
      update: { status: dto.status },
      create: {
        userId,
        bookId: book.id,
        status: dto.status,
      },
      include: { book: true },
    });

    let levelUpInfo = {
      isLevelUp: false,
      currentCount: 0,
    };
    if (dto.status === 'DONE') {
      levelUpInfo = await this.checkLevelUp(userId);
    }

    return {
      id: bookshelf.id,
      status: bookshelf.status,
      createdAt: bookshelf.createdAt,
      book: {
        isbn: bookshelf.book.isbn,
        title: bookshelf.book.title,
        author: bookshelf.book.author,
        imageUrl: bookshelf.book.imageUrl,
        description: bookshelf.book.description,
      },
      ...levelUpInfo,
    };
  }
  async getMyBooks(userId: number): Promise<BookshelfResponseDto[]> {
    const bookshelves = await this.prisma.bookshelf.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    return bookshelves.map((bookshelf) => ({
      id: bookshelf.id,
      status: bookshelf.status,
      createdAt: bookshelf.createdAt,
      emotion: bookshelf.emotion,
      aiTags: bookshelf.aiTags,
      book: {
        isbn: bookshelf.book.isbn,
        title: bookshelf.book.title,
        author: bookshelf.book.author,
        imageUrl: bookshelf.book.imageUrl,
        description: bookshelf.book.description,
      },
    }));
  }

  async getBookshelfItem(id: number, userId: number) {
    const item = await this.prisma.bookshelf.findFirst({
      where: { id, userId },
      include: { book: true },
    });

    if (!item) {
      throw new NotFoundException('책장 기록을 찾을 수 없어요.');
    }

    return {
      id: item.id,
      status: item.status,
      comment: item.comment,
      emotion: item.emotion,
      startDate: item.startDate,
      phrase: item.phrase,
      endDate: item.endDate,
      createdAt: item.createdAt,
      aiComment: item.aiComment,
      intent: item.intent,
      sub: item.sub,
      book: {
        isbn: item.book.isbn,
        title: item.book.title,
        author: item.book.author,
        imageUrl: item.book.imageUrl,
      },
    };
  }

  async updateBookshelf(id: number, userId: number, dto: UpdateBookshelfDto) {
    const item = await this.prisma.bookshelf.findFirst({
      where: { id, userId },
      include: { book: true },
    });

    if (!item) {
      throw new NotFoundException('내 책장에 등록된 책이 없어요');
    }

    let aiComment: string | undefined;
    let aiTags: string[] | undefined;

    const isCommentChanged =
      dto.comment !== undefined && dto.comment !== item.comment;
    const isEmotionChanged =
      dto.emotion !== undefined && dto.emotion !== item.emotion;

    if (isCommentChanged || isEmotionChanged) {
      try {
        const aiResult: AITagResponseDto =
          await this.aiService.generateCommentAndTags({
            bookTitle: item.book.title,
            review: dto.comment ?? item.comment ?? '',
            emotion: dto.emotion ?? item.emotion ?? '',
          });

        aiComment = aiResult.aiComment;
        aiTags = aiResult.aiTags;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('[ai Error]', error.message);
        }
      }

      // 책 내용이 아니라 사용자의 감상/감정을 임베딩해서 별도로 저장.
      // 채팅 RAG 검색에서 "위로받은 책" 같은 감상 기반 질문도 걸리게 하기 위함.
      const finalComment = dto.comment ?? item.comment ?? '';
      const finalEmotion = dto.emotion ?? item.emotion ?? '';

      if (finalComment || finalEmotion) {
        try {
          const reflectionText = `감정: ${finalEmotion} 감상: ${finalComment}`;
          const reflectionEmbedding =
            await this.embeddingService.createEmbedding(reflectionText);

          await this.prisma.$executeRaw`
            INSERT INTO "BookshelfEmbedding" ("userId", "bookId", "embedding")
            VALUES (${userId}, ${item.bookId}, ${JSON.stringify(reflectionEmbedding)}::vector)
            ON CONFLICT ("userId", "bookId")
            DO UPDATE SET embedding = EXCLUDED.embedding
          `;
        } catch (error: unknown) {
          console.error('[Bookshelf Embedding Error]', error);
        }
      }
    }

    const updated = await this.prisma.bookshelf.update({
      where: { id },
      data: {
        status: dto.status,
        comment: dto.comment,
        emotion: dto.emotion,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        phrase: dto.phrase,
        ...(aiComment !== undefined && { aiComment }),
        ...(aiTags !== undefined && { aiTags: { set: aiTags } }),
        intent: dto.intent,
        sub: dto.sub,
      },
      include: { book: true },
    });

    let levelUpInfo = {
      isLevelUp: false,
      currentCount: 0,
    };
    if (dto.status === 'DONE' && item.status !== 'DONE') {
      levelUpInfo = await this.checkLevelUp(userId);
    }

    return {
      ...updated,
      ...levelUpInfo,
    };
  }

  async getSimilarBooks(
    userId: number,
    limit: number = 5,
  ): Promise<SimilarBookResult[]> {
    // BookEmbedding엔 더 이상 userId가 없어서(전역 콘텐츠 인덱스), 사용자가 어떤
    // 책을 가지고 있는지는 Bookshelf를 거쳐서 알아낸 뒤 해당 책들의 임베딩을 평균낸다.
    const userAvgVector = await this.prisma.$queryRaw<{ embedding: string }[]>`
    SELECT AVG(be.embedding)::text as embedding
    FROM (
      SELECT "bookId"
      FROM "Bookshelf"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 5
    ) recent
    JOIN "BookEmbedding" be ON be."bookId" = recent."bookId"
  `;

    if (!userAvgVector || userAvgVector.length === 0) return [];

    // 사용자가 책이 0권이면 AVG(embedding)이 NULL인 행 하나가 돌아오는데(빈 집합이
    // 아님), 그 NULL을 그대로 벡터 정렬에 쓰면 정렬 기준 없이 아무 책이나 반환됨.
    const avgVector = userAvgVector[0].embedding;
    if (!avgVector) return [];

    const similarBooks = await this.prisma.$queryRaw<SimilarBookResult[]>`
    SELECT b.title, b.author
    FROM "Book" b
    JOIN "BookEmbedding" be ON b.id = be."bookId"
    WHERE be."bookId" NOT IN (
      SELECT "bookId" FROM "Bookshelf" WHERE "userId" = ${userId}
    )
    ORDER BY be.embedding <=> ${avgVector}::vector
    LIMIT ${limit}
  `;

    return similarBooks;
  }

  async deleteBooks(userId: number, bookshelfIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      const items = await tx.bookshelf.findMany({
        where: {
          id: { in: bookshelfIds },
          userId,
        },
        select: { bookId: true },
      });

      if (items.length === 0) {
        throw new NotFoundException('삭제할 책을 찾을 수 없습니다.');
      }

      const bookIds = items.map((i) => i.bookId);
      const { count } = await tx.bookshelf.deleteMany({
        where: {
          id: { in: bookshelfIds },
          userId,
        },
      });
      await tx.$executeRaw`
        DELETE FROM "BookEmbedding"
        WHERE "userId" = ${userId}
        AND "bookId" IN (${Prisma.join(bookIds)})
      `;

      return { success: true, count };
    });
  }
}
