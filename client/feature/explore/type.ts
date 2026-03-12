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
