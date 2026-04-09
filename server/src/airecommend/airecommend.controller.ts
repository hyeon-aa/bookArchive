import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AirecommendService } from './airecommend.service';
import {
  AiRecommendRequestDto,
  AiReportResponseDto,
  AITasteRecommendResponseDto,
} from './dto/ai-recommend.dto';

@Throttle({ default: { ttl: 60000, limit: 5 } })
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
    @CurrentUser('userId') userId: number,
  ): Promise<AITasteRecommendResponseDto> {
    return this.service.getTasteRecommendations(userId);
  }

  @Get('ai-report')
  @UseGuards(JwtAuthGuard)
  async getAiReport(
    @CurrentUser('userId') userId: number,
  ): Promise<AiReportResponseDto> {
    return this.service.getAIReport(userId);
  }
}
