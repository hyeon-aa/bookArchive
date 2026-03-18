import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CancelPaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ready')
  async ready(@CurrentUser('userId') userId: number) {
    const payment = await this.paymentService.createReady(userId);

    return {
      orderId: payment.orderId,
      amount: payment.amount,
      orderName: payment.orderName,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  async confirm(
    @Body() dto: ConfirmPaymentDto,
  ): Promise<Record<string, unknown>> {
    return await this.paymentService.confirm(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancel(
    @Body() dto: CancelPaymentDto,
  ): Promise<Record<string, unknown>> {
    return await this.paymentService.cancel(dto);
  }

  @Get('me')
  async getMyPayments(@CurrentUser('userId') userId: number) {
    return await this.paymentService.getMyPayments(userId);
  }
}
