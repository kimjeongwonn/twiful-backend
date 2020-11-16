import { Module } from '@nestjs/common';
import { UtilModule } from '../util/util.module';
import { TwitterService } from './twitter.service';

@Module({
  imports: [UtilModule],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}
