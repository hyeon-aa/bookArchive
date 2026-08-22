import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AladinService } from './aladin.service';

@Module({
  imports: [HttpModule],
  providers: [AladinService],
  exports: [AladinService],
})
export class AladinModule {}
