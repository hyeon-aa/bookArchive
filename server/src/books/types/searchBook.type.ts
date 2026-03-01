//네이버 API 응답 타입
export interface BookItem {
  isbn: string;
  title: string;
  author: string;
  image: string;
  description: string;
}

export interface BookSearchResponse {
  items: BookItem[];
}
