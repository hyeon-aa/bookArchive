"use client";

import { useGetMe } from "@/feature/auth/queries";
import { MyPageMenuItem } from "@/feature/mypage/components/MyPageMenuItem";
import { MyPageProfile } from "@/feature/mypage/components/MyPageProfile";
import { MembershipBanner } from "@/feature/payment/components/MembershipBanner";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookMarked,
  Clock,
  CreditCard,
  LogOut,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLogout } = useAuthStore();
  const { data: userInfoData, isLoading } = useGetMe();

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      setLogout();
      queryClient.clear();
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 font-medium">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-10">
      {userInfoData && (
        <MyPageProfile
          nickname={userInfoData.nickname}
          level={userInfoData.level || 1}
          isMember={userInfoData.isMember}
        />
      )}

      {userInfoData && !userInfoData.isMember && (
        <div className="px-4 -mt-10 relative z-10">
          <MembershipBanner />
        </div>
      )}

      <div className="px-4 mt-8 space-y-3">
        <h3 className="text-sm font-bold text-gray-800 ml-1 mb-2">나의 활동</h3>
        <MyPageMenuItem
          icon={<MessageSquareQuote size={20} />}
          label="기록한 문장들"
          onClick={() => router.push("/mypage/phrases")}
        />
        <MyPageMenuItem
          icon={<Clock size={20} />}
          label="독서 타임라인"
          onClick={() => router.push("/mypage/timeline")}
        />
        <MyPageMenuItem
          icon={<BookMarked size={20} />}
          label="내 독서태그 기록"
          onClick={() => router.push("/mypage/tags")}
        />
      </div>

      <div className="px-4 mt-8 space-y-3">
        <h3 className="text-sm font-bold text-gray-800 ml-1 mb-2">
          서비스 설정
        </h3>
        <MyPageMenuItem
          icon={<ShieldCheck size={20} />}
          label="개인정보 처리방침"
        />
        <MyPageMenuItem
          icon={<CreditCard size={20} />}
          label="결제 내역 관리"
          onClick={() => router.push("/mypage/payments")}
        />

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white border border-red-50 rounded-2xl text-red-400 hover:bg-red-50 transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span className="text-sm font-semibold">로그아웃</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
