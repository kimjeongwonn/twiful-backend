import { Connection } from 'typeorm';
import { Review } from './models/review.model';

export const reviewProviders = [
  {
    provide: 'REVIEW_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Review),
    inject: ['DATABASE_CONNECTION'],
  },
];
