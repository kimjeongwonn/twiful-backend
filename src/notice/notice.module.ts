import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeResolver } from './notice.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './models/notice.model';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  providers: [NoticeService, NoticeResolver],
})
export class NoticeModule {}
