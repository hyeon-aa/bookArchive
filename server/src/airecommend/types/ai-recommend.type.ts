export interface AIRecommendDraft {
  reason: string;
  books: {
    title: string;
    author?: string;
  }[];
}
