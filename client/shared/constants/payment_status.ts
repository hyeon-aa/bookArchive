export const PAYMENT_STATUS_CONFIG = {
  DONE: {
    label: "결제완료",
    className: "bg-green-50 text-green-600",
  },
  CANCELED: {
    label: "취소완료",
    className: "bg-red-50 text-red-500",
  },
  READY: {
    label: "결제대기",
    className: "bg-amber-50 text-amber-600",
  },
  FAILED: {
    label: "결제실패",
    className: "bg-gray-100 text-gray-500",
  },
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_CONFIG;
