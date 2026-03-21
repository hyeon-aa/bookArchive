export interface RecommendBookItemResponse {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
}

export interface DailyQuoteResponse {
  quote: string;
  bookTitle: string;
  author: string;
  context: string;
  reason: string;
}

export interface RecommendedBook {
  book: {
    title: string;
    author: string;
    imageUrl: string;
    isbn: string;
    description: string;
  };
  reason: string;
}

export interface TasteRecommendResponse {
  tasteSummary: string;
  familiarBooks: RecommendedBook[];
  challengeBooks: RecommendedBook[];
}

export interface AIRecommendResponse {
  reason: string;
  books: RecommendBookItemResponse[];
}

export interface AiReportResponse {
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
