import Decimal from 'decimal.js';
import { PercentageOptionsDto } from 'src/commons/finances/dtos/finance.dto';
import {
  DEFAULT_PRECISION,
  DEFAULT_ROUNDING,
} from 'src/constants/calculate.constants';

export class CalculateUtils {
  static calculatePercentual(options: PercentageOptionsDto): number {
    const { value, percentage } = options;
    const precision = options.precision || DEFAULT_PRECISION;

    try {
      if (!value) {
        return 0;
      }

      Decimal.set({ precision, rounding: DEFAULT_ROUNDING });

      const liquidPrice = new Decimal(value).minus(
        new Decimal(value).times(percentage).dividedBy(100),
      );

      return liquidPrice.toNumber();
    } catch (error) {
      throw new Error(`Error calculating percentual: ${error}`);
    }
  }

  static sumValues(values: number[]): number {
    if (!values?.length) {
      return 0;
    }

    try {
      return values
        .reduce((acc, value) => acc.plus(value), new Decimal(0))
        .toNumber();
    } catch (error) {
      throw new Error(`Error summing values: ${error}`);
    }
  }

  static divider(value: number, divider: number): number {
    if (!value || !divider) {
      return 0;
    }

    try {
      return new Decimal(value).dividedBy(divider).toNumber();
    } catch (error) {
      throw new Error(`Error dividing values: ${error}`);
    }
  }

  static multiplyValues(values: number[]): number {
    if (!values?.length) {
      return 0;
    }

    try {
      return values
        .reduce((acc, value) => acc.times(value), new Decimal(1))
        .toNumber();
    } catch (error) {
      throw new Error(`Error multiplying values: ${error}`);
    }
  }
}
