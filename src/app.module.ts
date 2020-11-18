import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Connection } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import * as typeormConfig from './config/typeorm';
import { ProfileModule } from './profile/profile.module';
import { RecruitModule } from './recruit/recruit.module';
import { ReviewModule } from './review/review.module';
import { TasteModule } from './taste/taste.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    UserModule,
    AuthModule,
    ProfileModule,
    ReviewModule,
    RecruitModule,
    TasteModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(__dirname, '/schema.gql'),
      context: ({ req }) => ({ req }),
    }),
  ],
  providers: [],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
