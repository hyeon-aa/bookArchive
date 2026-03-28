import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "./api";
import { chatKeys } from "./keys";

export const useChatRooms = () => {
  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: chatApi.getRooms,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createRooms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

export const useChatMessages = (roomId: number) => {
  return useQuery({
    queryKey: chatKeys.messages(roomId),
    queryFn: () => chatApi.getChatRoomItem(roomId),
    enabled: !!roomId,
  });
};
