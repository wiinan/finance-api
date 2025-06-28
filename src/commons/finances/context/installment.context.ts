import {
  FinanceHandlerDto,
  FinancePayBodyDto,
  FinancePayOptionsDto,
  FinancePayRequestDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import {
  IBaseContext,
  IFinanceService,
  IInstallmentService,
} from '../interfaces';
import { CalculateUtils } from 'src/helpers/calculate';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import { DataSource, EntityManager } from 'typeorm';
import { FinanceService, InstallmentService } from '../services';
import { Finance, FinanceInstallment } from 'src/database/entities';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  FINANCE_STATUS,
  PAYMENT_METHODS,
} from 'src/constants/finance.constants';
import { QueueProducerService } from 'src/workers/producer-queue';
import { first } from 'lodash';
import * as dayjs from 'dayjs';

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
    const finance =
      currentFinance.installment?.length === 1 &&
      first(currentFinance.installment);

    if (!finance || finance.paymentMethodId !== PAYMENT_METHODS.INSTALLMENT) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    if (
      [FINANCE_STATUS.CLOSED, FINANCE_STATUS.PAID].includes(finance.statusId) ||
      finance.receivedValue >= finance.liquidPrice
    )
      throw new HttpException('FINANCE_ALREADY_PAID', HttpStatus.BAD_REQUEST);

    if (
      [FINANCE_STATUS.CLOSED, FINANCE_STATUS.REFUND].includes(finance.statusId)
    )
      throw new HttpException('FINANCE_CANNOT_BE_PAID', HttpStatus.BAD_REQUEST);
  }

  mountFinancePayData(
    currentFinance: Finance,
    data: FinancePayBodyDto,
  ): FinancePayOptionsDto {
    const financeInstallment = currentFinance.installment.find(
      (installment) => installment.installment === data.installment,
    );

    if (!financeInstallment) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const financeReceivedValue = CalculateUtils.sumValues([
      currentFinance.receivedValue,
      data.receivedValue,
    ]);

    return {
      userBalance: CreateFinanceHelper.getBalenceProps(data),
      filter: {
        userId: currentFinance.userId,
        financeId: currentFinance.id,
        installment: financeInstallment.installment,
        installmentId: financeInstallment.id,
      },
      finance: {
        receivedValue: financeReceivedValue,
        statusId: CreateFinanceHelper.getFinanceStatus(
          financeReceivedValue,
          currentFinance.liquidPrice,
        ),
      },
      financeInstallment: {
        paidAt: dayjs().toDate(),
        payerInfo: data.payerInfo,
        statusId: CreateFinanceHelper.getFinanceStatus(
          data.receivedValue,
          ~~financeInstallment.liquidPrice || 0,
        ),
        receivedValue: CalculateUtils.sumValues([
          ~~financeInstallment.receivedValue || 0,
          data.receivedValue,
        ]),
      },
    };
  }

  public async executePayTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinancePayOptionsDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );
    this.installmentService = new InstallmentService(
      transactionalEntityManager.getRepository(FinanceInstallment),
    );

    const promises = [
      this.financeService.update(financeHandler.filter, financeHandler.finance),
    ];

    if (financeHandler.financeInstallment) {
      promises.push(
        this.installmentService.update(
          financeHandler.filter,
          financeHandler.financeInstallment,
        ),
      );
    }

    await Promise.all(promises);
  }

  public async savePayFinances(
    options: FinancePayRequestDto,
    dataSource: DataSource,
  ): Promise<void> {
    this.installmentService = new InstallmentService(
      dataSource.getRepository(FinanceInstallment),
    );

    await this.installmentService.update(
      {
        installmentId: options.filter.installmentId,
      },
      { statusId: FINANCE_STATUS.PROCESSING },
    );

    await this.payTransactionQueue?.addJob(options);
  }

  async removeFinanceInfo(): Promise<void> {
    await Promise.resolve();
  }
}
