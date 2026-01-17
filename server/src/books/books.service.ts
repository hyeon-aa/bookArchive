import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { SearchResponseDto } from './dto/booksearch-dto';
import { BookSearchResponse } from './types/searchBook.type';

@Injectable()
export class BooksService {
  constructor(private readonly http: HttpService) {}

  async search(query: string): Promise<SearchResponseDto[]> {
    const res = await firstValueFrom(
      this.http.get<BookSearchResponse>(
        'https://openapi.naver.com/v1/search/book.json',
        {
          params: { query, display: 10 },
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
    }));
  }
}
