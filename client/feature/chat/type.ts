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
  // true면 사용자가 실제로 가진 책, false면 "추천해줘" 의도일 때 전역
  // 후보 풀에서 뽑힌 아직 안 읽은 책.
  isOwned: boolean;
}

export interface ChatStreamChunk {
  text?: string;
  done?: boolean;
  error?: string;
  relatedBooks?: RelatedBook[];
}

export interface ChatRoom {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
}

export interface ChatMessageRecord {
  id: number;
  roomId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  roomId: number;
  message: string;
}

export interface DeleteChatResponse {
  success: boolean;
  count: number;
}

export type ChatRoomsResponse = ChatRoom[];
export type ChatMessagesResponse = ChatMessageRecord[];
export type CreateRoomResponse = ChatRoom;
