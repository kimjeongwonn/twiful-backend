import { Module } from '@nestjs/common';
import { ArrayUtil } from './util.array';
import { StringUtil } from './util.string';

@Module({
  providers: [ArrayUtil, StringUtil],
  exports: [ArrayUtil, StringUtil],
})
export class UtilModule {}
