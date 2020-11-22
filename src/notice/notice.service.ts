import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './models/notice.model';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
  ) {}
}
