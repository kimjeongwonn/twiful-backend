import { Test } from '@nestjs/testing';
import { ArrayUtil } from './util.array';
import { StringUtil } from './util.string';

describe('객체관련 유틸리티', () => {
  let arrayUtil: ArrayUtil;
  let stringUtil: StringUtil;
  //테스트별로 필요한 모듈 초기화
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArrayUtil, StringUtil],
    }).compile();

    //메소드 가져오기(정적)
    arrayUtil = module.get<ArrayUtil>(ArrayUtil);
    stringUtil = module.get<StringUtil>(StringUtil);
  });

  describe('문자 필터링', () => {
    test('공백과 특수문자 제거하기', () => {
      const Input =
        '한글과    1222 22**$*$ 일본😓 2   山堂無おうちで学ぼう！言fdsjfkasj DDD';
      expect(stringUtil.filteringString(Input)).toBe(
        '한글과122222일본2山堂無おうちで学ぼう言fdsjfkasjDDD',
      );
    });
    test('공백과 특수문자 검사하기', () => {
      const Input1 = '가나다라';
      const Input2 = 'dkddk가나다!!';
      const Input3 = 'dmd 안녕';
      const Input4 = '글럴앙学';
      const Input5 = '122그렇군';
      const Input6 = '몰라ㅏㅏ';
      const Input7 = '12312312313123堂12312312';
      const Input8 = '잘한다ㅋㅋ';
      expect(stringUtil.testString(Input1)).toBe(false);
      expect(stringUtil.testString(Input2)).toBe(true);
      expect(stringUtil.testString(Input3)).toBe(true);
      expect(stringUtil.testString(Input4)).toBe(false);
      expect(stringUtil.testString(Input5)).toBe(false);
      expect(stringUtil.testString(Input6)).toBe(true);
      expect(stringUtil.testString(Input7)).toBe(false);
      expect(stringUtil.testString(Input8)).toBe(true);
    });
  });

  describe.skip('배열 분리하기', () => {
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
