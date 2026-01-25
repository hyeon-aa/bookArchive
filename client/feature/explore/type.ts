export interface RecommendBookItem {
  isbn: string;
  title: string;
  author: string;
  imageUrl: string;
}

export interface DailyQuote {
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
  };
  reason: string;
}

export interface TasteRecommend {
  tasteSummary: string;
  familiarBooks: RecommendedBook[];
  challengeBooks: RecommendedBook[];
}
