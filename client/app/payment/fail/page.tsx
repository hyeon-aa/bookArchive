"use client";

import { Suspense } from "react";

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PaymentFailPage />
    </Suspense>
  );
}
