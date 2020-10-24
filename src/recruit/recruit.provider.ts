import { Connection } from 'typeorm';
import { Recruit } from './models/recruit.model';

export const recruitProviders = [
  {
    provide: 'RECRUIT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Recruit),
    inject: ['DATABASE_CONNECTION'],
  },
];
