import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './models/category.model';
import { Taste } from './models/taste.model';
import { TasteResolver } from './taste.resolver';
import { TasteService } from './taste.service';

@Module({
  imports: [TypeOrmModule.forFeature([Taste, Category])],
  providers: [TasteService, TasteResolver],
})
export class TasteModule {}
