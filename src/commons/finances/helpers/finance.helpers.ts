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
import { FINANCE_STATUS } from 'src/constants/finance.constants';
import { BadRequestException } from '@nestjs/common';

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
      ]),
      description: SchemaUtils.getILikeFilter(filter.description),
      competence: SchemaUtils.betweenDates(filter.startDate, filter.endDate),
      isDeleted: false,
      user: { isDeleted: false },
    };

    return whereOptions as FindOptionsWhere<T>;
  }

  public static validateFinanceToRemove(finance?: Finance | null) {
    if (!finance) {
      throw new BadRequestException('FINANCE_NOT_FOUND');
    }

    if (
      ![
        FINANCE_STATUS.CANCELED,
        FINANCE_STATUS.OPEN,
        FINANCE_STATUS.CLOSED,
      ].includes(finance.statusId)
    ) {
      throw new BadRequestException('FINANCE_CANNOT_BE_REMOVED');
    }
  }
}
