import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 외부에서 쓸 수 있게 내보내기
})
export class PrismaModule {}
