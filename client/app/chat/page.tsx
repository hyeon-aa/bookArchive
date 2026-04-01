"use client";

import { useChatRooms } from "@/feature/chat/queries";
import { ChatRoom } from "@/feature/chat/type";
import { DeleteChatsConfirmModal } from "@/shared/components/common/DeleteChatsConfirmModal";
import { useModal } from "@/shared/hooks/useModal";
import { Check, ChevronLeft, MessageSquarePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChatListPage() {
  const router = useRouter();
  const { data: rooms = [], isLoading } = useChatRooms();
  const { open } = useModal();

  const [selectedIds, setselectedIds] = useState<number[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  const handleCreateRoom = () => {
    router.push("/chat/new");
  };

  const toggleSelectChat = (id: number) => {
    setselectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteChats = () => {
    if (selectedIds.length === 0) return;

    open(() => (
      <DeleteChatsConfirmModal
        selectedIds={selectedIds}
        onSuccess={() => {
          setIsEdit(false);
          setselectedIds([]);
        }}
      />
    ));
  };

  const toggleEditMode = () => {
    setIsEdit((prev) => !prev);
    setselectedIds([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9F7]">
      <header className="px-5 py-4 bg-white border-b border-[#E3E8E0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ChevronLeft size={24} />
          </button>

          <div>
            <h1 className="text-base font-bold text-[#3F3F3F]">
              북 큐레이터 AI
            </h1>
            <p className="text-[10px] text-[#A6BCAF]">내 책장 기반 채팅</p>
          </div>
        </div>

        {isEdit ? (
          <button onClick={toggleEditMode} className="text-sm text-gray-500">
            취소
          </button>
        ) : (
          <button onClick={handleCreateRoom}>
            <MessageSquarePlus size={22} className="text-[#7C9885]" />
          </button>
        )}
      </header>

      {isEdit && (
        <div className="px-4 py-3 bg-white border-b flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedIds.length}개 선택됨
          </span>

          <button
            onClick={handleDeleteChats}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1 text-red-500 text-sm"
          >
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      )}

      {!isEdit && rooms.length > 0 && (
        <div className="px-4 pt-3">
          <button onClick={toggleEditMode} className="text-sm text-[#7C9885]">
            선택
          </button>
        </div>
      )}

      <main className="flex-1 px-4 py-4">
        {isLoading ? (
          <p className="text-center text-sm mt-10">불러오는 중...</p>
        ) : rooms.length === 0 ? (
          <div className="text-center mt-20">
            <p>채팅 없음</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rooms.map((room: ChatRoom) => {
              const isSelected = selectedIds.includes(room.id);

              return (
                <li key={room.id}>
                  <div className={`flex items-center gap-3 `}>
                    {isEdit && (
                      <button
                        onClick={() => toggleSelectChat(room.id)}
                        className={`w-5 h-5 border rounded-md flex items-center justify-center transition ${
                          isSelected
                            ? "bg-[#7C9885] border-[#7C9885]"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => !isEdit && router.push(`/chat/${room.id}`)}
                      className="flex-1 text-left px-4 py-4 bg-white rounded-2xl border"
                    >
                      <p className="font-bold text-sm">{room.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(room.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
