import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRelation } from '../user/models/friendRelation.model';
import { TasteRelation } from '../taste/models/tasteRelation.model';
import { Recruit } from './models/recruit.model';
import { RecruitResolver } from './recruit.resolver';
import { RecruitService } from './recruit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recruit, TasteRelation, FriendRelation])],
  providers: [RecruitService, RecruitResolver],
  exports: [RecruitService],
})
export class RecruitModule {}
