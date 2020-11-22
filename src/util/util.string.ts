import { Injectable } from '@nestjs/common';

@Injectable()
export class StringUtil {
  filteringString(src: string): string {
    const regex = /[^?:가-힣a-zA-Z1-9ぁ-ゔァ-ヴー々〆〤一-龥]/g;
    return src.replace(regex, '');
  }

  testString(src: string): boolean {
    const regex = /[^?:가-힣a-zA-Z1-9ぁ-ゔァ-ヴー々〆〤一-龥]/g;
    return !regex.test(src);
  }
}
