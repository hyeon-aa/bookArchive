export interface BookInfo {
  id: number;
  title: string;
  imageUrl: string;
  author: string;
}

export interface MyPhraseResponse {
  id: number;
  phrase: string;
  comment: string | null;
  emotion: string | null;
  createdAt: string;
  book: BookInfo;
}

export interface TagStat {
  name: string;
  count: number;
}

export interface MyTagsResponse {
  tags: TagStat[];
}

export interface BookTimelineResponse {
  month: string;
  books: string[];
}
