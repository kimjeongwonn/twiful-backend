import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { Recruit } from './models/recruit.model';
import { recruitProviders } from './recruit.provider';
import { RecruitResolver } from './recruit.resolver';
import { RecruitService } from './recruit.service';

@Module({
  imports: [DatabaseModule],
  providers: [RecruitService, RecruitResolver, Recruit, ...recruitProviders],
})
export class RecruitModule {}
