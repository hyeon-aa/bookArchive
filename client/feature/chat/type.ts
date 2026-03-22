export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RelatedBook {
  title: string;
  author: string;
  description: string | null;
  status: string | null;
  comment: string | null;
  emotion: string | null;
  startDate: string | null;
  endDate: string | null;
  aiTags: string[] | null;
}

export interface ChatStreamChunk {
  text?: string;
  done?: boolean;
  error?: string;
  relatedBooks?: RelatedBook[];
}
