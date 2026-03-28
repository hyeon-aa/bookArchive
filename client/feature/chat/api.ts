import { api } from "@/lib/api";
import {
  ChatMessagesResponse,
  ChatRoomsResponse,
  CreateRoomResponse,
} from "./type";

export const chatApi = {
  getRooms: async () => {
    const data = await api.get<ChatRoomsResponse>("/chat/rooms");
    return data;
  },

  createRooms: async () => {
    const data = await api.post<CreateRoomResponse>("/chat/rooms");
    return data;
  },

  getChatRoomItem: async (roomId: number) => {
    const data = await api.get<ChatMessagesResponse>(`/chat/rooms/${roomId}`);
    return data;
  },
};
