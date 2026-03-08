export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentResponse {
  id: number;
  orderId: string;
  amount: number;
  orderName: string;
  status: "READY" | "DONE" | "FAIL";
  paymentKey?: string;
  userId: number;
  createdAt: string;
}

export interface TossConfirmResponse extends PaymentResponse {
  method?: string;
  requestedAt?: string;
  approvedAt?: string;
  checkout?: {
    url: string;
  };
}
