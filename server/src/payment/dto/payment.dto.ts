export class ConfirmPaymentDto {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export class CancelPaymentDto {
  paymentKey: string;
  cancelReason: string;
}

export class myPaymentsDto {
  paymentKey: string | null;
  orderId: string;
  createdAt: Date;
  status: string;
  orderName: string;
  amount: number;
}
