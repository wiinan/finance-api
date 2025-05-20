import { pick, times } from 'lodash';
import {
  AdditionalFinanceOptionsDto,
  creditCardInfoDto,
  FinanceDto,
  FinanceInstallmentsDto,
  PaymentLinkInfoDto,
  PixInfoDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { CalculateUtils } from 'src/helpers/calculate';
import * as dayjs from 'dayjs';
import { UserBalanceDto } from 'src/commons/users/dtos/user.dto';
import { FINANCE_TYPES } from 'src/constants/finance.constants';

export class CreateFinanceHelper {
  public static normalizeFinanceData(
    data: RequestCreateFinanceDto,
    liquidPrice: number,
    installments?: number,
  ): FinanceDto {
    return {
      liquidPrice,
      installments,
      ...pick(data, [
        'price',
        'description',
        'competence',
        'typeId',
        'statusId',
        'paymentMethodId',
        'userId',
      ]),
    };
  }

  static mountFinanceInstallments(
    data: FinanceDto,
    additionalOptions: AdditionalFinanceOptionsDto,
  ): FinanceInstallmentsDto[] {
    const { installments, price, liquidPrice } = data;
    const financeInstallments: FinanceInstallmentsDto[] = [];

    if (!installments || !data.id) {
      return financeInstallments;
    }

    const financeId = data.id;
    const recurrenceDays = additionalOptions.recurrenceDays || 30;
    const installmentLiquidPrice = CalculateUtils.divider(
      liquidPrice || 0,
      installments,
    );
    const installmentPrice = CalculateUtils.divider(price, installments);
    data.id = undefined;

    times(installments, (index) => {
      const installment = index + 1;
      const nextDate = CalculateUtils.multiplyValues([
        recurrenceDays,
        installment,
      ]);

      const competence = dayjs(data.competence);

      financeInstallments.push({
        ...data,
        financeId,
        liquidPrice: installmentLiquidPrice,
        price: installmentPrice,
        installment,
        competence: dayjs(competence).add(nextDate, 'days').toDate(),
      });
    });

    return financeInstallments;
  }

  public static getBalenceProps({
    liquidPrice,
    typeId,
    receivedValue,
  }: FinanceDto): UserBalanceDto {
    const balanceOptions: UserBalanceDto = {};

    if (liquidPrice) {
      const balanceByTypeId = {
        [FINANCE_TYPES.OUT]: 'expenseBalance',
        [FINANCE_TYPES.INPUT]: 'incomeBalance',
      };

      balanceOptions[balanceByTypeId[typeId]] = liquidPrice;
    }

    if (receivedValue) {
      balanceOptions.receivedBalance = receivedValue;
    }

    return balanceOptions;
  }

  public static mountFinanceInfoData(
    financeInfo: creditCardInfoDto | PixInfoDto | PaymentLinkInfoDto,
    financeId: number,
  ) {
    return { financeId, ...financeInfo };
  }
}
