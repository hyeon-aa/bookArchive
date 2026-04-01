"use client";

import { chatKeys } from "@/feature/chat/keys";
import { useChatMessages, useCreateRoom } from "@/feature/chat/queries";
import { ChatMessage, ChatMessageRecord } from "@/feature/chat/type";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { ChevronLeft, SendHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatRoomPage() {
  const router = useRouter();
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

  return (
    <div className="flex flex-col h-screen bg-[#F8F9F7]">
      <header className="px-5 py-4 bg-white border-b border-[#E3E8E0] flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-base font-bold text-[#3F3F3F]">북 큐레이터 AI</h1>
          <p className="text-[10px] text-[#A6BCAF] mt-0.5">내 책장 기반 채팅</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full pb-20">
            <div className="w-14 h-14 rounded-full bg-[#E8F0EB] flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-[#4A4A4A] font-bold text-base mb-1">
              책에 대해 뭐든 물어보세요
            </p>
            <p className="text-[11px] text-[#A6BCAF] text-center leading-relaxed">
              내 책장 데이터를 바탕으로
              <br />
              맞춤 답변을 드려요
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLastAssistant =
            idx === messages.length - 1 && msg.role === "assistant";

          return (
            <div
              key={idx}
              className={`flex mb-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#7C9885] flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                  AI
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${
                    isUser
                      ? "bg-[#7C9885] text-white rounded-br-md"
                      : "bg-white border border-[#E3E8E0] text-[#3F3F3F] rounded-bl-md shadow-sm"
                  }`}
              >
                {msg.content}
                {isLastAssistant && isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-[#7C9885] ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <div className="flex items-end gap-2 px-4 py-3 bg-white border-t border-[#E3E8E0]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={isStreaming}
          rows={1}
          placeholder="책에 대해 무엇이든 물어보세요..."
          className="flex-1 resize-none rounded-2xl border border-[#E3E8E0] px-4 py-2.5
            text-sm text-[#3F3F3F] placeholder-[#C4C9C4] focus:outline-none
            focus:border-[#7C9885] transition-colors leading-relaxed
            disabled:bg-[#F8F9F7] disabled:cursor-not-allowed"
          style={{ minHeight: "42px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isStreaming}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-[#7C9885] flex items-center
            justify-center text-white transition-all active:scale-95
            disabled:bg-[#D4DDD7] disabled:cursor-not-allowed"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
