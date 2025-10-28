/**
 * 农历转换工具模块
 * 使用专业的 lunar-javascript 库进行准确的农历转换
 */

import { Lunar, Solar } from 'lunar-javascript';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  yearGan: string;
  yearZhi: string;
  monthGan: string;
  monthZhi: string;
  dayGan: string;
  dayZhi: string;
}

/**
 * 天干地支映射表
 */
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 月份地支对应表（农历）
 */
export const MONTH_ZHI = [
  null, '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'
];

/**
 * 时辰地支对应表（24小时制）
 */
export const TIME_ZHI_MAP: { [key: number]: string } = {
  23: '子', 0: '子', 1: '丑', 2: '丑', 3: '寅', 4: '寅',
  5: '卯', 6: '卯', 7: '辰', 8: '辰', 9: '巳', 10: '巳',
  11: '午', 12: '午', 13: '未', 14: '未', 15: '申', 16: '申',
  17: '酉', 18: '酉', 19: '戌', 20: '戌', 21: '亥', 22: '亥'
};

/**
 * 时辰名称对应表
 */
export const TIME_NAMES: { [key: string]: string } = {
  '子': '子时', '丑': '丑时', '寅': '寅时', '卯': '卯时',
  '辰': '辰时', '巳': '巳时', '午': '午时', '未': '未时',
  '申': '申时', '酉': '酉时', '戌': '戌时', '亥': '亥时'
};

/**
 * 农历月份名称
 */
export const LUNAR_MONTH_NAMES: { [key: number]: string } = {
  1: '正月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月',
  7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '冬月', 12: '腊月'
};

/**
 * 使用 lunar-javascript 库进行准确的农历转换
 */
export class LunarCalendarConverter {
  /**
   * 公历日期转农历
   * @param solarDate 公历日期 YYYY-MM-DD
   * @returns 农历日期信息
   */
  static solarToLunar(solarDate: string): LunarDate {
    const [year, month, day] = solarDate.split('-').map(Number);
    const solar = Solar.fromDate(new Date(year, month - 1, day));
    const lunar = solar.getLunar();

    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeapMonth: lunar.isLeap(),
      yearGan: TIANGAN[lunar.getYearGan()],
      yearZhi: DIZHI[lunar.getYearZhi()],
      monthGan: TIANGAN[lunar.getMonthGan()],
      monthZhi: DIZHI[lunar.getMonthZhi()],
      dayGan: TIANGAN[lunar.getDayGan()],
      dayZhi: DIZHI[lunar.getDayZhi()]
    };
  }

  /**
   * 获取时辰地支
   * @param timeString 时间字符串 HH:MM
   * @returns 时辰地支
   */
  static getTimeZhi(timeString: string): string {
    const [hour] = timeString.split(':').map(Number);
    return TIME_ZHI_MAP[hour] || '子';
  }

  /**
   * 获取时辰天干
   * @param timeString 时间字符串 HH:MM
   * @param dayGan 日干
   * @returns 时辰天干
   */
  static getTimeGan(timeString: string, dayGan: string): string {
    const [hour] = timeString.split(':').map(Number);
    const timeZhiIndex = Object.values(TIME_ZHI_MAP).indexOf(TIME_ZHI_MAP[hour] || '子');
    const dayGanIndex = TIANGAN.indexOf(dayGan);

    // 时干公式：时干 = (日干 * 2 + 时支) % 10
    const timeGanIndex = (dayGanIndex * 2 + timeZhiIndex) % 10;
    return TIANGAN[timeGanIndex];
  }

  /**
   * 格式化农历日期为中文显示
   */
  static formatLunarDate(lunarDate: LunarDate): string {
    const monthName = LUNAR_MONTH_NAMES[lunarDate.month] || '正月';
    const leapPrefix = lunarDate.isLeapMonth ? '闰' : '';

    return `${lunarDate.year}年${leapPrefix}${monthName}${lunarDate.day}日`;
  }

  /**
   * 获取完整的八字字符串
   */
  static getBaziString(lunarDate: LunarDate, timeString: string): string {
    const timeZhi = this.getTimeZhi(timeString);
    const timeGan = this.getTimeGan(timeString, lunarDate.dayGan);

    return `${lunarDate.yearGan}${lunarDate.yearZhi} ${lunarDate.monthGan}${lunarDate.monthZhi} ${lunarDate.dayGan}${lunarDate.dayZhi} ${timeGan}${timeZhi}`;
  }

  /**
   * 验证八字计算的准确性
   */
  static validateBazi(solarDate: string, timeString: string): {
    isValid: boolean;
    message?: string;
    lunarInfo?: LunarDate;
    baziString?: string;
  } {
    try {
      const lunarInfo = this.solarToLunar(solarDate);
      const baziString = this.getBaziString(lunarInfo, timeString);

      // 验证基本信息完整性
      if (!lunarInfo.year || !lunarInfo.month || !lunarInfo.day) {
        return {
          isValid: false,
          message: '农历日期计算异常，建议使用专业万年历确认'
        };
      }

      // 验证八字完整性
      const baziParts = baziString.split(' ');
      if (baziParts.length !== 4 || baziParts.some(part => part.length !== 2)) {
        return {
          isValid: false,
          message: '八字信息不完整，建议使用专业万年历确认'
        };
      }

      return {
        isValid: true,
        lunarInfo,
        baziString
      };
    } catch (error) {
      return {
        isValid: false,
        message: '八字计算出错，请检查输入信息或使用专业万年历确认'
      };
    }
  }

  /**
   * 获取时辰详细信息
   */
  static getTimeInfo(timeString: string): {
    name: string;
    zhi: string;
    startHour: number;
    endHour: number;
    description: string;
  } {
    const [hour] = timeString.split(':').map(Number);
    const zhi = this.getTimeZhi(timeString);
    const timeZhiEntries = Object.entries(TIME_ZHI_MAP).filter(([_, value]) => value === zhi);

    const timeRanges: { [key: string]: { start: number; end: number; desc: string } } = {
      '子': { start: 23, end: 1, desc: '夜半' },
      '丑': { start: 1, end: 3, desc: '鸡鸣' },
      '寅': { start: 3, end: 5, desc: '平旦' },
      '卯': { start: 5, end: 7, desc: '日出' },
      '辰': { start: 7, end: 9, desc: '食时' },
      '巳': { start: 9, end: 11, desc: '隅中' },
      '午': { start: 11, end: 13, desc: '日中' },
      '未': { start: 13, end: 15, desc: '日映' },
      '申': { start: 15, end: 17, desc: '晡时' },
      '酉': { start: 17, end: 19, desc: '日入' },
      '戌': { start: 19, end: 21, desc: '黄昏' },
      '亥': { start: 21, end: 23, desc: '人定' }
    };

    const range = timeRanges[zhi];

    return {
      name: TIME_NAMES[zhi],
      zhi,
      startHour: range?.start || 0,
      endHour: range?.end || 2,
      description: range?.desc || ''
    };
  }
}