import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ValidDateDto } from 'src/dtos/utils.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

export class Utils {
  static isValidDate(date: string | Date | dayjs.Dayjs): boolean {
    return dayjs(date).isValid();
  }

  static isValidDateRange({ startDate, endDate }: ValidDateDto) {
    return dayjs(endDate).diff(dayjs(startDate), 'month') <= 6;
  }

  static validateDateSchema({ startDate, endDate }: ValidDateDto): boolean {
    const isValidDates =
      this.isValidDate(startDate) && this.isValidDate(endDate);

    return isValidDates && this.isValidDateRange({ startDate, endDate });
  }

  static getDateWithoutTimezones(date?: string | Date) {
    const timezone = dayjs(date).utcOffset();
    const currentTime = dayjs(date).subtract(timezone, 'minutes').toDate();

    return currentTime;
  }
}
