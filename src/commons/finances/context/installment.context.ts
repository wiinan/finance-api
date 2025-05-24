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
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import { EntityManager } from 'typeorm';
import { FinanceService, InstallmentService } from '../services';
import { Finance, FinanceInstallment } from 'src/database/entities';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PAYMENT_METHODS } from 'src/constants/finance.constants';
import { QueueProducerService } from 'src/workers/producer-queue';

export class InstallmentContext implements IBaseContext {
  private financeService: IFinanceService;
  private installmentService: IInstallmentService;

  constructor(private readonly payTransactionQueue?: QueueProducerService) {}

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions } = data;

    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: additionalOptions?.taxes || 0,
    });
    const finance = CreateFinanceHelper.normalizeFinanceData(
      data,
      liquidPrice,
      additionalOptions?.installments,
    );

    const options: FinanceHandlerDto = {
      finance,
      additionalOptions: data.additionalOptions,
      userBalance: CreateFinanceHelper.getBalenceProps(finance),
    };

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
      const financeInstallments = CreateFinanceHelper.mountFinanceInstallments(
        financeHandler.newFinance,
        financeHandler.additionalOptions,
      );

      await this.installmentService.createInstallment(financeInstallments);
    }
  }

  validateCreateFinance(data: RequestCreateFinanceDto): void {
    const { additionalOptions } = data;

    if (
      data.paymentMethodId !== PAYMENT_METHODS.INSTALLMENT ||
      !data.installments ||
      !additionalOptions?.installments
    ) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  validatePayFinance(currentFinance: Finance): void {
    if (!currentFinance) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  mountFinancePayData;
  executePayTransactions;
  savePayFinances;
}
