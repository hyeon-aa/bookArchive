import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { AirecommendService } from './airecommend.service';
import {
  AiRecommendRequestDto,
  AITasteRecommendResponseDto,
} from './dto/ai-recommend.dto';

interface AuthRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('ai-recommend')
export class AirecommendController {
  constructor(private readonly service: AirecommendService) {}

  @Post()
  async recommend(@Body() dto: AiRecommendRequestDto) {
    return this.service.recommend(dto);
  }

  @Get('daily-quote')
  async getDailyQuote() {
    return this.service.getDailyQuote();
  }

  @Get('taste')
  @UseGuards(JwtAuthGuard)
  async getTasteRecommendations(
    @Req() req: AuthRequest,
  ): Promise<AITasteRecommendResponseDto> {
    return this.service.getTasteRecommendations(req.user.userId);
  }
}
