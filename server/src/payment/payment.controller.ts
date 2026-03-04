import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ConfirmPaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

interface AuthRequest extends Request {
  user: { userId: number };
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ready')
  async ready(@Req() req: AuthRequest) {
    const payment = await this.paymentService.createReady(req.user.userId);

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
}
