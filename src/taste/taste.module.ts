import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Taste } from './models/taste.model';
import { TasteResolver } from './taste.resolver';
import { TasteService } from './taste.service';

@Module({
  imports: [TypeOrmModule.forFeature([Taste]), UserModule],
  providers: [TasteService, TasteResolver],
})
export class TasteModule {}
