import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { ReviewModule } from './review/review.module';
import { RecruitModule } from './recruit/recruit.module';
import { TasteModule } from './taste/taste.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import * as typeormConfig from './config/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    AuthModule,
    UserModule,
    ProfileModule,
    ReviewModule,
    RecruitModule,
    TasteModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(__dirname, '/schema.gql'),
      context: ({ req }) => ({ req }),
    }),
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
