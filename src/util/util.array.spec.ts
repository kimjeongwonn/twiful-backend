import { Test } from '@nestjs/testing';
import { ArrayUtil } from './util.array';

describe('객체관련 유틸리티', () => {
  let arrayUtil: ArrayUtil;
  //테스트별로 필요한 모듈 초기화
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArrayUtil],
    }).compile();

    //메소드 가져오기(정적)
    arrayUtil = module.get<ArrayUtil>(ArrayUtil);
  });

  describe('ArraySet 가져오기', () => {
    test('리터럴로 함수 실행', () => {
      const inputA = [1, 2, 3, 4, 5];
      const inputB = [2, 4, 6, 7, 8];
      const {
        inter,
        diff: { a, b },
      } = arrayUtil.getArraySet(inputA, inputB);
      expect(inter).toEqual([2, 4]);
      expect(a).toEqual([1, 3, 5]);
      expect(b).toEqual([6, 7, 8]);
    });
    test('객체로 함수 실행', () => {
      const inputA = [
        { id: 1, text: 'hi' },
        { id: 2, text: 'hello' },
        { id: 3, text: '안녕' },
      ];
      const inputB = [
        { id: 2, text: 'hi' },
        { id: 4, text: 'hello' },
        { id: 5, text: '안녕' },
      ];
      const {
        inter,
        diff: { a, b },
      } = arrayUtil.getArraySet(inputA, inputB, 'id');
      expect(inter).toEqual([{ id: 2, text: 'hello' }]);
      expect(a).toEqual([
        { id: 1, text: 'hi' },
        { id: 3, text: '안녕' },
      ]);
      expect(b).toEqual([
        { id: 4, text: 'hello' },
        { id: 5, text: '안녕' },
      ]);
    });
  });
});
