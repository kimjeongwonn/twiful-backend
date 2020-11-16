import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { TwitterModule } from '../twitter/twitter.module';
import { UtilModule } from '../util/util.module';
import { FriendRelation } from './models/friendRelation.model';
import { User } from './models/user.model';
import { UserService } from './user.service';

describe('사용자 테스트', () => {
  let userService: UserService;
  let userRepositroy: MockType<Repository<User>>;
  //테스트별로 필요한 모듈 초기화
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UtilModule, TwitterModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getUserData: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(FriendRelation),
          useFactory: repositoryMockFactory,
        },
        UserService,
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepositroy = module.get(getRepositoryToken(User));
  });

  describe('찾기', () => {
    let user: User;
    beforeEach(() => {
      user = new User();
    });
    it('모든 유저 불러오기', async () => {
      const allUsers = await userService.findAll();
      expect(allUsers).toBeInstanceOf(Array);
    });
  });
});

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  }),
);
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
