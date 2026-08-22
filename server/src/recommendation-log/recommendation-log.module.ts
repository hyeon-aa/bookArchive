import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RecommendationLogService } from './recommendation-log.service';

@Module({
  imports: [PrismaModule],
  providers: [RecommendationLogService],
  exports: [RecommendationLogService],
})
export class RecommendationLogModule {}
