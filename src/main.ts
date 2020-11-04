import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const session = require('express-session');
require('dotenv').config();

declare global {
  namespace Express {
    interface Context {
      req: Express.Request;
    }
    interface Session {
      token: string;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: 'http://localhost:3001', credentials: true },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    }),
  );
  await app.listen(process.env.SERVER_PORT || 3000);
}
bootstrap();
