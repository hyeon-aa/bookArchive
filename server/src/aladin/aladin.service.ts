import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AladinItem, AladinItemListResponse } from './types/aladin-item.type';

@Injectable()
export class AladinService {
  constructor(private readonly http: HttpService) {}

  // 네이버 도서 API엔 목록/베스트셀러 조회가 없어서, 후보 풀을 미리 채우는
  // 배치 시딩 용도로만 알라딘을 사용한다. 사용자 대상 실시간 검색은 여전히 네이버.
  async fetchBestsellers(
    categoryId: number,
    maxResults = 50,
  ): Promise<AladinItem[]> {
    const res = await firstValueFrom(
      this.http.get<AladinItemListResponse>(
        'https://www.aladin.co.kr/ttb/api/ItemList.aspx',
        {
          params: {
            ttbkey: process.env.ALADIN_TTB_KEY,
            QueryType: 'Bestseller',
            CategoryId: categoryId,
            MaxResults: maxResults,
            start: 1,
            SearchTarget: 'Book',
            output: 'js',
            Version: '20131101',
          },
        },
      ),
    );

    return res.data.item ?? [];
  }
}
