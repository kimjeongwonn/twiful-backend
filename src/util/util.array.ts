import { Injectable } from '@nestjs/common';

@Injectable()
export class ArrayUtil {
  getArraySet(inputA: any[], inputB: any[], propertyName?: string) {
    const inter = [];

    const diffA = inputA.filter(a => {
      const compareA = propertyName ? a[propertyName] : a;
      if (
        inputB.find(b => {
          const compareB = propertyName ? b[propertyName] : b;
          return compareA === compareB;
        })
      )
        inter.push(a);
      else return true;
    });
    const diffB = inputB.filter(b => {
      const compareB = propertyName ? b[propertyName] : b;
      return !inputA.find(a => {
        const compareA = propertyName ? a[propertyName] : a;
        return compareA === compareB;
      });
    });

    return { inter, diff: { a: diffA, b: diffB } };
  }
}
