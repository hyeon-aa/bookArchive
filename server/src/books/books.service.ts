import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AladinService } from 'src/aladin/aladin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchResponseDto } from './dto/booksearch-dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly aladin: AladinService,
    private readonly prisma: PrismaService,
  ) {}

  // 임베딩 벡터로 전역 후보 풀(BookEmbedding)에서 직접 검색.
  // 키워드 검색(search)과 달리 실존이 이미 보장된 우리 DB의 책만 반환하므로,
  // 이 결과를 LLM에 후보로 넘기면 LLM이 실존하지 않는 책을 지어낼 수 없음.
  // categories가 주어지면 하이브리드 검색(벡터 유사도 + 장르 필터)으로 좁힘.
  async searchByVector(
    vectorStr: string,
    limit: number,
    categories?: string[],
  ): Promise<SearchResponseDto[]> {
    const categoryFilter =
      categories && categories.length > 0
        ? Prisma.sql`AND b.category = ANY(${categories})`
        : Prisma.empty;

    return this.prisma.$queryRaw<SearchResponseDto[]>`
      SELECT b.isbn, b.title, b.author, b."imageUrl", b.description, b.category
      FROM "Book" b
      JOIN "BookEmbedding" be ON be."bookId" = b.id
      WHERE 1=1 ${categoryFilter}
      ORDER BY be.embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;
  }

  // 네이버 '책' 검색 API가 2026-07-31에 완전히 종료되어(유예 기간·대체 API
  // 없음) 알라딘 ItemSearch로 교체.
  async search(query: string, start: number = 1): Promise<SearchResponseDto[]> {
    const items = await this.aladin.searchByKeyword(query, 10, start);

    return items.map((item) => ({
      isbn: item.isbn13,
      title: item.title.replace(/<[^>]*>/g, ''),
      author: item.author,
      imageUrl: item.cover,
      description: (item.description ?? '').replace(/<[^>]*>/g, ''),
      category: item.categoryName,
    }));
  }
}
