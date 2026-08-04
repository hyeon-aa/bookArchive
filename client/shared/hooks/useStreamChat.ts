import { chatKeys } from "@/feature/chat/keys";
import { useChatMessages, useCreateRoom } from "@/feature/chat/queries";
import { ChatMessage, ChatMessageRecord } from "@/feature/chat/type";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_CONNECT_RETRIES = 2;
const RETRY_DELAY_MS = 700;

// 스트림이 이미 시작된 뒤의 끊김은 재시도하지 않는다(이어받기가 불가능한 구조라 새 답변을 만드는 것과 같음).
// 연결 자체가 실패하는 경우에만 짧게 재시도한다.
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  signal: AbortSignal
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_CONNECT_RETRIES; attempt++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    try {
      return await fetch(url, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      lastError = error;
      if (attempt < MAX_CONNECT_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1))
        );
      }
    }
  }

  throw lastError;
}

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
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const stopStreaming = () => {
    abortControllerRef.current?.abort();
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      const response = await fetchWithRetry(
        `${BASE_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: currentRoomId,
            message: userMessage,
          }),
          signal: controller.signal,
        },
        controller.signal
      );

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
          if (chunk.error) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content || chunk.error,
                };
              }
              return updated;
            });
            return;
          }
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
      const isAborted =
        error instanceof DOMException && error.name === "AbortError";

      if (!isAborted) {
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
      }
      // 사용자가 직접 중단한 경우엔 이미 받은 내용을 그대로 두고 별도 처리하지 않음
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return {
    messages,
    input,
    setInput,
    isStreaming,
    sendMessage,
    stopStreaming,
    bottomRef,
  };
};
