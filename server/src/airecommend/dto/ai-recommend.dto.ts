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

export class AiReportResponseDto {
  reportTitle: string;
  topIntent: {
    label: string;
    count: number;
    insight: string;
  };
  intentVsEmotionAnalysis: {
    summary: string;
    details: string[];
  };
  character: {
    name: string;
    traits: string[];
    description: string;
    reason: string;
  };
  statistics: {
    totalBooks: number;
    mostFrequentEmotion: string;
    changeSummary: string;
  };
  coachMessage: string;
}

export class BookInfoDto {
  title: string;
  description: string;
  author: string;
  phrase: string | null;
  emotion: string | null;
  intent: string | null;
  sub: string | null;
}

export class AiReportRequestDto {
  books: BookInfoDto[];
}
