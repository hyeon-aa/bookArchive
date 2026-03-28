"use client";

import { useChatRooms, useCreateRoom } from "@/feature/chat/queries";
import { ChatRoom } from "@/feature/chat/type";
import { ChevronLeft, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatListPage() {
  const router = useRouter();
  const { data: rooms = [], isLoading } = useChatRooms();
  const { mutate: createRoom, isPending } = useCreateRoom();

  const handleCreateRoom = () => {
    createRoom(undefined, {
      onSuccess: (res) => {
        router.push(`/chat/${res.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9F7]">
      <header className="px-5 py-4 bg-white border-b border-[#E3E8E0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#3F3F3F]">
              북 큐레이터 AI
            </h1>
            <p className="text-[10px] text-[#A6BCAF] mt-0.5">
              내 책장 기반 채팅
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateRoom}
          disabled={isPending}
          className="p-2 hover:bg-[#E8F0EB] rounded-lg transition-colors"
        >
          <MessageSquarePlus size={22} className="text-[#7C9885]" />
        </button>
      </header>

      <main className="flex-1 px-4 py-4">
        {isLoading ? (
          <p className="text-center text-[#A6BCAF] text-sm mt-10">
            불러오는 중...
          </p>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-32">
            <div className="w-14 h-14 rounded-full bg-[#E8F0EB] flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-[#4A4A4A] font-bold text-base mb-1">
              아직 대화가 없어요
            </p>
            <p className="text-[11px] text-[#A6BCAF]">새 채팅을 시작해보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rooms.map((room: ChatRoom) => (
              <li key={room.id}>
                <button
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="w-full text-left px-4 py-4 bg-white rounded-2xl border border-[#E3E8E0] hover:bg-[#F8F9F7] transition-colors"
                >
                  <p className="font-bold text-sm text-[#3F3F3F]">
                    {room.title}
                  </p>
                  <p className="text-[11px] text-[#A6BCAF] mt-1">
                    {new Date(room.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
