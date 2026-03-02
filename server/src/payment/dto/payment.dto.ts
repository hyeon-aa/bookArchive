export class ReadyPaymentDto {
  orderId: string;
  amount: number;
  orderName: string;
}

export class ConfirmPaymentDto {
  paymentKey: string;
  orderId: string;
  amount: number;
}
