import { BookItem } from '../types/book-item.type';

export class AiRecommendRequestDto {
  currentMood: string;
  userTalk: string;
}

export class DailyQuoteResponseDto {
  quote: string;
  bookTitle: string;
  author: string;
  context: string;
  reason: string;
}

export class RecommendedBookDto {
  book: BookItem;
  reason: string;
}

export class AITasteRecommendResponseDto {
  tasteSummary: string;
  familiarBooks: RecommendedBookDto[];
  challengeBooks: RecommendedBookDto[];
}
