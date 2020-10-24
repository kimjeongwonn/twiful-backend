import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { Taste } from './models/taste.model';
import { tasteProviders } from './taste.provider';
import { TasteResolver } from './taste.resolver';
import { TasteService } from './taste.service';

@Module({
  imports: [DatabaseModule],
  providers: [TasteService, TasteResolver, Taste, ...tasteProviders],
})
export class TasteModule {}
