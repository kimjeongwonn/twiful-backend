import { Module, NestModule } from '@nestjs/common';
import { UtilModule } from 'src/util/util.module';
import { TwitterService } from './twitter.service';

@Module({
  imports: [UtilModule],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}
