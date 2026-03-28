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
  history: { role: "user" | "assistant"; content: string }[];
}

export type ChatRoomsResponse = ChatRoom[];
export type ChatMessagesResponse = ChatMessageRecord[];
export type CreateRoomResponse = ChatRoom;
