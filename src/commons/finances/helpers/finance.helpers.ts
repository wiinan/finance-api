import { Finance, FinanceInstallment } from 'src/database/entities';
import {
  creditCardInfoDto,
  listFinanceDto,
  ListFinanceFilterDto,
  PaymentLinkInfoDto,
  PixInfoDto,
} from '../dtos/finance.dto';
import { FindOptionsWhere } from 'typeorm';
import { SchemaUtils } from 'src/helpers/schema';
import { pick } from 'lodash';

export class FinanceHelper {
  private static getFinanceInfo(
    finance: Finance,
  ): creditCardInfoDto | PixInfoDto | PaymentLinkInfoDto {
    return finance.paymentLinkInfo || finance.creditCardInfo || finance.pixInfo;
  }

  public static mountListFinances(
    finances: Finance[],
    installments: FinanceInstallment[],
  ): listFinanceDto[] {
    const financesData: Array<listFinanceDto> = [];

    [...finances, ...installments].forEach(
      (finance: Finance & FinanceInstallment) => {
        const currentFinance = finance?.finance || finance;
        const type = currentFinance.type?.name;
        const user = currentFinance.user;
        const financeInfo = this.getFinanceInfo(currentFinance);

        financesData.push({
          id: finance.financeId || finance.id,
          installmentId: finance.installment && finance.id,
          price: finance.price,
          user: { name: user.name, id: user.id },
          type,
          financeInfo,
          liquidPrice: finance.liquidPrice,
          competence: finance.competence,
          status: finance.financeStatus.name,
          paymentMethod: finance.paymentMethod.name,
          createdAt: finance.createdAt,
          installment: finance.installment,
          installments: finance.installments,
          receivedValue: finance.receivedValue,
          paidAt: finance.paidAt,
        });
      },
    );

    return financesData;
  }

  public static getFinanceFilters<T>(
    filter: ListFinanceFilterDto,
  ): FindOptionsWhere<T> {
    const whereOptions = {
      ...pick(filter, [
        'typeId',
        'statusId',
        'paymentMethodId',
        'userId',
        'installments',
        'description',
      ]),
      competence: SchemaUtils.betweenDates(filter.startDate, filter.endDate),
      isDeleted: false,
      user: { isDeleted: false },
    };

    return whereOptions as FindOptionsWhere<T>;
  }
}
