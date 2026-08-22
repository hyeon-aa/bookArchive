import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchResponseDto } from './dto/booksearch-dto';
import { BookSearchResponse } from './types/searchBook.type';

@Injectable()
export class BooksService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  // 임베딩 벡터로 전역 후보 풀(BookEmbedding)에서 직접 검색.
  // 키워드 검색(search)과 달리 실존이 이미 보장된 우리 DB의 책만 반환하므로,
  // 이 결과를 LLM에 후보로 넘기면 LLM이 실존하지 않는 책을 지어낼 수 없음.
  async searchByVector(
    vectorStr: string,
    limit: number,
  ): Promise<SearchResponseDto[]> {
    return this.prisma.$queryRaw<SearchResponseDto[]>`
      SELECT b.isbn, b.title, b.author, b."imageUrl", b.description
      FROM "Book" b
      JOIN "BookEmbedding" be ON be."bookId" = b.id
      ORDER BY be.embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;
  }

  async search(query: string, start: number = 1): Promise<SearchResponseDto[]> {
    const res = await firstValueFrom(
      this.http.get<BookSearchResponse>(
        'https://openapi.naver.com/v1/search/book.json',
        {
          params: { query, display: 10, start: start },
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
          },
        },
      ),
    );

    return res.data.items.map((item) => ({
      isbn: item.isbn.split(' ')[0],
      title: item.title.replace(/<[^>]*>/g, ''),
      author: item.author,
      imageUrl: item.image,
      description: item.description.replace(/<[^>]*>/g, ''),
    }));
  }
}
