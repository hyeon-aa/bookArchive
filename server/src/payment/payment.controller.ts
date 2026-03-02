import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ConfirmPaymentDto, ReadyPaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

interface AuthRequest extends Request {
  user: { userId: number };
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ready')
  async ready(
    @Req() req: AuthRequest,
    @Body() dto: ReadyPaymentDto,
  ): Promise<Payment> {
    return await this.paymentService.createReady(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  async confirm(
    @Body() dto: ConfirmPaymentDto,
  ): Promise<Record<string, unknown>> {
    return await this.paymentService.confirm(dto);
  }
}
