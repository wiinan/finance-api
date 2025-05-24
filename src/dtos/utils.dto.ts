import * as dayjs from 'dayjs';

export type ValidDateDto = {
  startDate: string | Date | dayjs.Dayjs;
  endDate: string | Date | dayjs.Dayjs;
};
