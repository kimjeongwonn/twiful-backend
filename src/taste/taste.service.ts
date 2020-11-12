import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './models/category.model';
import { Taste } from './models/taste.model';

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste) private tasteRepository: Repository<Taste>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Taste[]> {
    return this.tasteRepository.find();
  }
}
