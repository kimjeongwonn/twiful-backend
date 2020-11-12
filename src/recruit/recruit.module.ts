import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recruit } from './models/recruit.model';
import { RecruitResolver } from './recruit.resolver';
import { RecruitService } from './recruit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recruit])],
  providers: [RecruitService, RecruitResolver],
})
export class RecruitModule {}
