import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException 추가!
import { aiService } from 'src/ai/ai.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AITagResponseDto } from '../ai/ai-response.dto';
import { AddBookDto } from './dto/add-book.dto';
import { BookshelfResponseDto } from './dto/bookshelf-response.dto';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

interface SimilarBookResult {
  title: string;
  author: string;
}

@Injectable()
export class BookshelfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: aiService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async addBook(
    userId: number,
    dto: AddBookDto,
  ): Promise<BookshelfResponseDto> {
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

    // [추가 포인트 1] 책은 이미 있어도 '임베딩'이 없는 경우가 많으므로 체크 로직 분리
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
      endDate: item.endDate,
      createdAt: item.createdAt,
      aicomment: item.aiComment,
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

    console.log('dto', dto);

    if (dto.comment || dto.emotion) {
      try {
        const aiResult: AITagResponseDto =
          await this.aiService.generateCommentAndTags({
            bookTitle: item.book.title,
            review: dto.comment ?? item.comment ?? '',
            emotion: dto.emotion ?? item.emotion ?? '',
          });

        aiComment = aiResult.comment;
        aiTags = aiResult.tags;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('[ai Error]', error.message);
        }
      }
    }

    return this.prisma.bookshelf.update({
      where: { id },
      data: {
        status: dto.status,
        comment: dto.comment,
        emotion: dto.emotion,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        aiComment,
        aiTags,
      },
      include: { book: true },
    });
  }

  async getSimilarBooks(
    userId: number,
    limit: number = 5,
  ): Promise<SimilarBookResult[]> {
    // 1. 타입을 명시적으로 정의 (embedding은 ::text로 가져오니 string임)
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
}
