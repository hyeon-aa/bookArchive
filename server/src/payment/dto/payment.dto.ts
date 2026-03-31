import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentKey: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsInt()
  @Min(0)
  amount: number;
}

export class CancelPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentKey: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
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
