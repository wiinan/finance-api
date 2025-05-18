import {
  FinanceHandlerDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import {
  IBaseContext,
  IFinanceService,
  IInstallmentService,
} from '../interfaces';
import { CalculateUtils } from 'src/helpers/calculate';
import { FinanceHelper } from '../helpers/finance.helpers';
import { EntityManager } from 'typeorm';
import { FinanceService, InstallmentService } from '../services';
import { Finance, FinanceInstallment } from 'src/database/entities';

export class InstallmentContext implements IBaseContext {
  private financeService: IFinanceService;
  private installmentService: IInstallmentService;

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions } = data;

    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: additionalOptions?.taxes || 0,
    });
    const finance = FinanceHelper.normalizeFinanceData(
      data,
      liquidPrice,
      additionalOptions?.installments,
    );

    const options: FinanceHandlerDto = {
      finance,
      additionalOptions: data.additionalOptions,
      userBalance: FinanceHelper.getBalenceProps(finance),
    };

    if (data.additionalOptions) {
      options.financeInstallments = FinanceHelper.mountFinanceInstallments(
        options.finance,
        data.additionalOptions,
      );
    }

    return options;
  }

  public async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    this.installmentService = new InstallmentService(
      transactionalEntityManager.getRepository(FinanceInstallment),
    );
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    if (financeHandler.additionalOptions) {
      const financeInstallments = FinanceHelper.mountFinanceInstallments(
        financeHandler.newFinance,
        financeHandler.additionalOptions,
      );

      await this.installmentService.createInstallment(financeInstallments);
    }
  }
}
