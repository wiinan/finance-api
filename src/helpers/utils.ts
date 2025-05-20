import * as dayjs from 'dayjs';
import { ValidDateDto } from 'src/dtos/utils.dto';

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
}
