import { chatKeys } from "@/feature/chat/keys";
import { useChatMessages, useCreateRoom } from "@/feature/chat/queries";
import { ChatMessage, ChatMessageRecord } from "@/feature/chat/type";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const useStreamChat = () => {
  const params = useParams();
  const rawRoomId = params.roomId as string;
  const isNewRoom = rawRoomId === "new";

  const [roomId, setRoomId] = useState<number | null>(
    isNewRoom ? null : Number(rawRoomId)
  );
  const queryClient = useQueryClient();
  const { mutateAsync: createRoom } = useCreateRoom();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history } = useChatMessages(roomId ?? 0);

  useEffect(() => {
    if (!history) return;

    setMessages((prevMessages) => {
      if (history.length === 0 && prevMessages.length > 0) {
        return prevMessages;
      }

      return history.map((m: ChatMessageRecord) => ({
        role: m.role,
        content: m.content,
      }));
    });
  }, [history]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);

    const currentHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      let currentRoomId = roomId;
      if (!currentRoomId) {
        const newRoom = await createRoom();
        currentRoomId = newRoom.id;
        setRoomId(currentRoomId);
        window.history.replaceState(null, "", `/chat/${currentRoomId}`);
      }

      const BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const token = getCookie("accessToken");
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: currentRoomId,
          message: userMessage,
          history: currentHistory,
        }),
      });

      if (!response.ok) throw new Error(`서버 오류: ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.replace(/^data: /, "").trim();
          if (!line) continue;

          const chunk = JSON.parse(line);
          if (chunk.done) {
            queryClient.invalidateQueries({
              queryKey: chatKeys.messages(currentRoomId!),
            });
            queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            return;
          }
          if (chunk.text) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + chunk.text,
                };
              }
              return updated;
            });
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && last.content === "") {
          updated[updated.length - 1] = {
            ...last,
            content: "메시지를 전송하지 못했어요. 다시 시도해 주세요.",
          };
        }
        return updated;
      });
      console.error("[Chat Error]", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isStreaming,
    sendMessage,
    bottomRef,
  };
};
