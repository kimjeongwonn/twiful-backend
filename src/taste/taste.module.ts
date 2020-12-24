import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringUtil } from '../util/util.string';
import { ProfileModule } from '../profile/profile.module';
import { Taste } from './models/taste.model';
import { TasteResolver } from './taste.resolver';
import { TasteService } from './taste.service';
import { Profile } from '../profile/models/profile.model';
import { TasteRelation } from './models/tasteRelation.model';

@Module({
  imports: [TypeOrmModule.forFeature([Taste, TasteRelation, Profile])],
  providers: [TasteService, TasteResolver, StringUtil],
  exports: [TasteService],
})
export class TasteModule {}
