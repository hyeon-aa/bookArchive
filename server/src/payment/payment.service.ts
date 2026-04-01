import { BadRequestException, Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CancelPaymentDto,
  ConfirmPaymentDto,
  MyPaymentsDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /*결제 요청 전, READY 상태의 결제 기록 생성*/
  async createReady(userId: number): Promise<Payment> {
    const orderId = `order_${randomUUID()}`;
    const MEMBERSHIP_PRICE = 3900;
    const MEMBERSHIP_NAME = '북아카이브 멤버십';

    return await this.prisma.payment.create({
      data: {
        orderId,
        amount: MEMBERSHIP_PRICE,
        orderName: MEMBERSHIP_NAME,
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
      await this.prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { orderId },
          data: { paymentKey, status: 'DONE' },
        });

        await tx.user.update({
          where: { id: updatedPayment.userId },
          data: { isMember: true },
        });
      });

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

  /*토스 페이먼츠 결제 취소*/
  async cancel(
    userId: number,
    dto: CancelPaymentDto,
  ): Promise<Record<string, unknown>> {
    const { paymentKey, cancelReason } = dto;

    const payment = await this.prisma.payment.findFirst({
      where: {
        paymentKey,
        userId,
        status: 'DONE',
      },
      select: { userId: true },
    });

    if (!payment) {
      throw new BadRequestException(
        '취소 가능한 결제 내역을 찾을 수 없습니다.',
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY ?? '';
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

    try {
      const response = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${encodedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentKey, cancelReason }),
        },
      );

      const result = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        throw new BadRequestException(result.message || '취소 실패');
      }
      //update나 create에서는 data를 쓴다.
      await this.prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { paymentKey },
          data: { status: 'CANCELED' },
        });

        await tx.user.update({
          where: { id: updatedPayment.userId },
          data: { isMember: false },
        });
      });

      return result;
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('결제 취소 중 오류가 발생했습니다.');
    }
  }

  //findMany에서는 select를 쓰고 여러건이므로 []을 반환
  async getMyPayments(userId: number): Promise<MyPaymentsDto[]> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      select: {
        paymentKey: true,
        orderId: true,
        createdAt: true,
        status: true,
        orderName: true,
        amount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }
}
