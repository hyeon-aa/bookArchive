import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { aiService } from 'src/ai/ai.service';
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
    private readonly aiService: aiService,
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
      const textToEmbed = `제목: ${book.title} 저자: ${book.author} 설명: ${book.description ?? ''}`;

      try {
        const embedding =
          await this.embeddingService.createEmbedding(textToEmbed);

        await this.prisma.$executeRaw`
          INSERT INTO "BookEmbedding" ("bookId", "userId", "embedding")
          VALUES (${book.id}, ${userId}, ${JSON.stringify(embedding)}::vector)
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

    if (dto.comment || dto.emotion) {
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
    // 1. 타입을 명시적으로 정의 (embedding은 ::text로 가져오니 string임 -> 문자열로 가져온거다.)
    const userLatestVector = await this.prisma.$queryRaw<
      { embedding: string }[]
    >`
    SELECT "embedding"::text 
    FROM "BookEmbedding" 
    WHERE "userId" = ${userId} 
    ORDER BY "createdAt" DESC 
    LIMIT 1
  `;

    if (!userLatestVector || userLatestVector.length === 0) return [];

    const vectorStr = userLatestVector[0].embedding;

    const similarBooks = await this.prisma.$queryRaw<SimilarBookResult[]>`
    SELECT b.title, b.author
    FROM "Book" b
    JOIN "BookEmbedding" be ON b.id = be."bookId"
    WHERE be."userId" != ${userId}
    ORDER BY be.embedding <=> ${vectorStr}::vector
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
