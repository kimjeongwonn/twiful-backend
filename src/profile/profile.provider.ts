import { Connection } from 'typeorm';
import { Profile } from './models/profile.model';

export const profileProviders = [
  {
    provide: 'PROFILE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Profile),
    inject: ['DATABASE_CONNECTION'],
  },
];
