export interface ReadyPaymentDto {
  orderId: string;
  amount: number;
  orderName: string;
}

export interface ConfirmPaymentDto {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentRecord {
  id: number;
  orderId: string;
  amount: number;
  orderName: string;
  status: "READY" | "DONE" | "FAIL";
  paymentKey?: string;
  userId: number;
  createdAt: string;
}

export interface TossConfirmResponse extends PaymentRecord {
  method?: string;
  requestedAt?: string;
  approvedAt?: string;
  checkout?: {
    url: string;
  };
}
