import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AladinItem, AladinItemListResponse } from './types/aladin-item.type';

@Injectable()
export class AladinService {
  constructor(private readonly http: HttpService) {}

  // 배치 시딩(베스트셀러 목록 조회)용. MaxResults는 호출당 최대 50으로
  // 서버 측에서 고정되어 있어서(100을 넣어도 50만 옴), 그 이상은 start로
  // 페이지를 넘겨야 함.
  async fetchBestsellers(
    categoryId: number,
    maxResults = 50,
    start = 1,
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
            start,
            SearchTarget: 'Book',
            output: 'js',
            Version: '20131101',
          },
        },
      ),
    );

    return res.data.item ?? [];
  }

  // 사용자 실시간 검색용 (원래 네이버가 담당했으나, 네이버 '책' 검색 API가
  // 2026-07-31에 완전히 종료되어 알라딘으로 교체함).
  async searchByKeyword(
    query: string,
    maxResults = 10,
    start = 1,
  ): Promise<AladinItem[]> {
    const res = await firstValueFrom(
      this.http.get<AladinItemListResponse>(
        'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx',
        {
          params: {
            ttbkey: process.env.ALADIN_TTB_KEY,
            Query: query,
            QueryType: 'Title',
            MaxResults: maxResults,
            start,
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
