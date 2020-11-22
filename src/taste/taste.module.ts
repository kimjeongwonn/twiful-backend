import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringUtil } from '../util/util.string';
import { ProfileModule } from '../profile/profile.module';
import { Taste } from './models/taste.model';
import { TasteResolver } from './taste.resolver';
import { TasteService } from './taste.service';

@Module({
  imports: [TypeOrmModule.forFeature([Taste]), ProfileModule],
  providers: [TasteService, TasteResolver, StringUtil],
})
export class TasteModule {}
