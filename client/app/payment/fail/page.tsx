"use client";

import { PaymentFailContent } from "@/feature/payment/components/PaymentFailContent";
import { Suspense } from "react";

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
