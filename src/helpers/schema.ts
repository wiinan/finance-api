import * as dayjs from 'dayjs';
import { Between, FindOperator } from 'typeorm';

export class SchemaUtils {
  public static betweenDates(
    startDate: Date,
    endDate: Date,
  ): FindOperator<Date> {
    return Between<Date>(
      dayjs(startDate).startOf('day').toDate(),
      dayjs(endDate).endOf('day').toDate(),
    );
  }
}
