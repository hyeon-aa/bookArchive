import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { MypageService } from './mypage.service';

@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @UseGuards(JwtAuthGuard)
  @Get('phrases')
  async getMyPhrase(@CurrentUser('userId') userId: number) {
    return this.mypageService.getMyPhrase(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tags')
  async getMyTags(@CurrentUser('userId') userId: number) {
    return this.mypageService.getMyTags(userId);
  }
}
