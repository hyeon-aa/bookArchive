// 알라딘 ItemList API 응답 타입
export interface AladinItem {
  title: string;
  author: string;
  description: string;
  isbn13: string;
  cover: string;
  categoryName: string;
}

export interface AladinItemListResponse {
  item: AladinItem[];
}
