import {
  FinanceHandlerDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { IBaseContext, IFinanceService } from '../interfaces';
import { CalculateUtils } from 'src/helpers/calculate';
import { FinanceHelper } from '../helpers/finance.helpers';
import { EntityManager } from 'typeorm';
import { FinanceService } from '../services';
import { Finance } from 'src/database/entities';

export class BaseContext implements IBaseContext {
  private financeService: IFinanceService;

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions } = data;

    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: additionalOptions?.taxes || 0,
    });
    const finance = FinanceHelper.normalizeFinanceData(data, liquidPrice);

    return {
      finance,
      additionalOptions: data.additionalOptions,
      userBalance: FinanceHelper.getBalenceProps(finance),
    };
  }

  public async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    await Promise.all(promises);
  }

  validateCreateFinance(): void {
    return;
  }
}
