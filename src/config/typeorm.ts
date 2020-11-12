import { TypeOrmModuleOptions } from '@nestjs/typeorm';
require('dotenv').config();

const typeormConfig: TypeOrmModuleOptions = {
  type: 'mariadb',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  autoLoadEntities: true,
  synchronize: true,
  // logging: true,
};

module.exports = typeormConfig;
