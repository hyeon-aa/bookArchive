import { PaymentSuccessContent } from "@/feature/payment/components/PaymentSuccessContent";
import { Suspense } from "react";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          결제 정보를 확인 중입니다...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
