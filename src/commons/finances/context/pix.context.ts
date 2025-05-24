import { CalculateUtils } from 'src/helpers/calculate';
import {
  FinanceHandlerDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import {
  IBaseContext,
  IFinanceService,
  IInstallmentService,
  IFinancePixService,
} from '../interfaces';
import { EntityManager } from 'typeorm';
import {
  FinancePixService,
  FinanceService,
  InstallmentService,
} from '../services';
import {
  Finance,
  FinanceInstallment,
  PixFinanceInfo,
} from 'src/database/entities';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PAYMENT_METHODS } from 'src/constants/finance.constants';
import { QueueProducerService } from 'src/workers/producer-queue';

export class PixContext implements IBaseContext {
  private financeService: IFinanceService;
  private financePixService: IFinancePixService;
  private installmentService: IInstallmentService;

  constructor(private readonly payTransactionQueue?: QueueProducerService) {}

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions, pixInfo } = data;

    const totalTaxes = CalculateUtils.sumValues([
      additionalOptions?.taxes || 0,
      pixInfo?.taxes || 0,
    ]);
    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: totalTaxes,
    });
    const finance = CreateFinanceHelper.normalizeFinanceData(data, liquidPrice);

    const options: FinanceHandlerDto = {
      finance,
      pixInfo: { ...pixInfo, userId: data.userId },
      userBalance: CreateFinanceHelper.getBalenceProps(finance),
    };

    if (additionalOptions?.installments) {
      options.financeInstallments =
        CreateFinanceHelper.mountFinanceInstallments(
          options.finance,
          additionalOptions,
        );
    }

    return options;
  }
  public async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );
    this.financePixService = new FinancePixService(
      transactionalEntityManager.getRepository(PixFinanceInfo),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    const promises: Promise<any>[] = [];

    if (financeHandler.pixInfo) {
      const pixData = CreateFinanceHelper.mountFinanceInfoData(
        financeHandler.pixInfo,
        financeHandler.newFinance.id,
      );

      promises.push(this.financePixService.createPix(pixData));
    }

    if (financeHandler.additionalOptions) {
      const financeInstallments = CreateFinanceHelper.mountFinanceInstallments(
        financeHandler.newFinance,
        financeHandler.additionalOptions,
      );
      this.installmentService = new InstallmentService(
        transactionalEntityManager.getRepository(FinanceInstallment),
      );

      promises.push(
        this.installmentService.createInstallment(financeInstallments),
      );
    }

    await Promise.all(promises);
  }

  validateCreateFinance(data: RequestCreateFinanceDto): void {
    const { pixInfo } = data;

    if (data.paymentMethodId !== PAYMENT_METHODS.PIX || !pixInfo) {
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
