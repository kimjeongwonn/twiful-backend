import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { ReviewModule } from './review/review.module';
import { RecruitModule } from './recruit/recruit.module';
import { TasteModule } from './taste/taste.module';

@Module({
  imports: [
    UserModule,
    ProfileModule,
    ReviewModule,
    RecruitModule,
    TasteModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
  ],
})
export class AppModule {}
