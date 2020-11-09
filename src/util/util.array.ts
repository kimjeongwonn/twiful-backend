import { Injectable } from '@nestjs/common';

@Injectable()
export class ArrayUtil {
  getArraySet<T>(shortArr: T[], longArr: T[]): [T[], T[]] {
    const difference: T[] = [];
    const intersection: T[] = [];
    shortArr.forEach(x => {
      if (longArr.includes(x)) intersection.push(x);
      else difference.push(x);
    });
    return [intersection, difference];
  }
}

//LEFT JOIN, RIGHT JOIN도 찾아내기
