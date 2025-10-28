/**
 * lunar-javascript 库的类型声明
 * 用于TypeScript类型检查
 */

declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    isLeap(): boolean;
    getYearGan(): number;
    getYearZhi(): number;
    getMonthGan(): number;
    getMonthZhi(): number;
    getDayGan(): number;
    getDayZhi(): number;
    getEightChar(): EightChar;
    getZodiac(): string;
    getJieQi(): string | null;
    toFullString(): string;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getFiveElements(): any;
  }

  export function fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
}