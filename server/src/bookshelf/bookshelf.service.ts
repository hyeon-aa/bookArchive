import { Injectable } from '@nestjs/common';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddBookDto } from './dto/add-book.dto';
import { BookshelfResponseDto } from './dto/bookshelf-response.dto';

@Injectable()
export class BookshelfService {
  constructor(private readonly prisma: PrismaService) {}

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
      book: {
        isbn: bookshelf.book.isbn,
        title: bookshelf.book.title,
        author: bookshelf.book.author,
        imageUrl: bookshelf.book.imageUrl,
      },
    }));
  }
}
