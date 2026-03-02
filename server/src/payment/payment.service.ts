import { BadRequestException, Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmPaymentDto, ReadyPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /*결제 요청 전, READY 상태의 결제 기록 생성*/
  async createReady(userId: number, dto: ReadyPaymentDto): Promise<Payment> {
    console.log(
      `[Payment] 결제 준비 생성 시작 - UserId: ${userId}, OrderId: ${dto.orderId}`,
    );

    return await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        orderName: dto.orderName,
        userId: userId,
        status: 'READY',
      },
    });
  }

  /*토스 페이먼츠 결제 승인*/
  async confirm(dto: ConfirmPaymentDto): Promise<Record<string, unknown>> {
    const { paymentKey, orderId, amount } = dto;
    const secretKey = process.env.TOSS_SECRET_KEY ?? '';
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

    console.log(`[Payment] 결제 승인 요청 시작 - OrderId: ${orderId}`);

    try {
      const response = await fetch(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${encodedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        },
      );

      const result = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        const errorMessage =
          typeof result.message === 'string' ? result.message : '승인 실패';
        console.error('[Toss Error]', errorMessage);
        throw new BadRequestException(errorMessage);
      }

      await this.prisma.payment.update({
        where: { orderId },
        data: {
          paymentKey,
          status: 'DONE',
        },
      });

      console.log(`[Payment] 결제 승인 완료 - OrderId: ${orderId}`);
      return result;
    } catch (error: unknown) {
      await this.handlePaymentFailure(orderId);

      if (error instanceof BadRequestException) throw error;
      if (error instanceof Error) {
        console.error('[Payment Confirm Error]', error.message);
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('알 수 없는 결제 에러가 발생했습니다.');
    }
  }

  private async handlePaymentFailure(orderId: string): Promise<void> {
    try {
      await this.prisma.payment.update({
        where: { orderId },
        data: { status: 'FAIL' },
      });
    } catch (dbError) {
      console.error('[Payment DB Update Error] 상태 변경 실패:', dbError);
    }
  }
}
