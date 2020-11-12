import { Module } from '@nestjs/common';
import { ArrayUtil } from './util.array';

@Module({
  providers: [ArrayUtil],
  exports: [ArrayUtil],
})
export class UtilModule {}
