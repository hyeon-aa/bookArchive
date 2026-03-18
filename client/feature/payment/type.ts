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

export interface CancelPaymentRequest {
  paymentKey: string;
  cancelReason: string;
}

export interface TossCancelResponse {
  status: "CANCELED" | "DONE";
  paymentKey: string;
  orderId: string;
  cancels: Array<{
    cancelAmount: number;
    cancelReason: string;
    canceledAt: string;
  }>;
}

export interface myPaymentsResponse {
  paymentKey: string | null;
  orderId: string;
  createdAt: string;
  status: string;
  orderName: string;
  amount: number;
}
