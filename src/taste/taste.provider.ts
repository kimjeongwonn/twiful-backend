import { Connection } from 'typeorm';
import { Taste } from './models/taste.model';

export const tasteProviders = [
  {
    provide: 'TASTE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Taste),
    inject: ['DATABASE_CONNECTION'],
  },
];
