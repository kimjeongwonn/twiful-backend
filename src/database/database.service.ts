import { createConnection } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () =>
      await createConnection({
        type: 'mariadb',
        host: '10.211.55.6',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'twiful-db',
        entities: [__dirname + '/../**/models/*.model{.ts,.js}'],
        synchronize: true,
      }),
  },
];
