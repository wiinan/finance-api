import * as dayjs from 'dayjs';
import { Between, FindOperator, ILike } from 'typeorm';

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

  public static getILikeFilter(
    text?: string,
  ): FindOperator<string> | undefined {
    return text ? ILike(`%${text}%`) : undefined;
  }
}
