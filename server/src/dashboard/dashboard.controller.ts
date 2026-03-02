import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { DashboardService } from './dashboard.service';

interface AuthRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboard(@Req() req: AuthRequest) {
    return this.dashboardService.getDashboard(req.user.userId);
  }
}
