import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException 추가!
import { Book } from '@prisma/client';
import { aiService } from 'src/ai/ai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AITagResponseDto } from '../ai/ai-response.dto';
import { AddBookDto } from './dto/add-book.dto';
import { BookshelfResponseDto } from './dto/bookshelf-response.dto';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

@Injectable()
export class BookshelfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: aiService,
  ) {}

  async addBook(
    userId: number,
    dto: AddBookDto,
  ): Promise<BookshelfResponseDto> {
    const existingBook: Book | null = await this.prisma.book.findUnique({
      where: { isbn: dto.isbn },
    });

    const book =
      existingBook ??
      (await this.prisma.book.create({
        data: {
          isbn: dto.isbn,
          title: dto.title,
          author: dto.author,
          imageUrl: dto.imageUrl,
        },
      }));

    const bookshelf = await this.prisma.bookshelf.create({
      data: {
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
}
