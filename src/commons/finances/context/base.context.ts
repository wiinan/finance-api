import {
  FinanceHandlerDto,
  FinancePayBodyDto,
  FinancePayOptionsDto,
  FinancePayRequestDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { IBaseContext, IFinanceService } from '../interfaces';
import { CalculateUtils } from 'src/helpers/calculate';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import { DataSource, EntityManager } from 'typeorm';
import { FinanceService } from '../services';
import { Finance } from 'src/database/entities';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FINANCE_STATUS } from 'src/constants/finance.constants';
import { QueueProducerService } from 'src/workers/producer-queue';
import * as dayjs from 'dayjs';

export class BaseContext implements IBaseContext {
  private financeService: IFinanceService;

  constructor(private readonly payTransactionQueue?: QueueProducerService) {}

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions } = data;

    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: additionalOptions?.taxes || 0,
    });
    const finance = CreateFinanceHelper.normalizeFinanceData(data, liquidPrice);

    return {
      finance,
      additionalOptions: data.additionalOptions,
      userBalance: CreateFinanceHelper.getBalenceProps(finance),
    };
  }

  mountFinancePayData(
    currentFinance: Finance,
    data: FinancePayBodyDto,
  ): FinancePayOptionsDto {
    return {
      userBalance: CreateFinanceHelper.getBalenceProps(data),
      filter: { userId: currentFinance.userId, financeId: currentFinance.id },
      finance: {
        payerInfo: data.payerInfo,
        paidAt: dayjs().toDate(),
        statusId: CreateFinanceHelper.getFinanceStatus(
          data.receivedValue,
          currentFinance.liquidPrice,
        ),
        receivedValue: CalculateUtils.sumValues([
          currentFinance.receivedValue,
          data.receivedValue,
        ]),
      },
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

  public async executePayTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinancePayOptionsDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );

    await this.financeService.update(
      financeHandler.filter,
      financeHandler.finance,
    );
  }

  public async savePayFinances(
    options: FinancePayRequestDto,
    dataSource: DataSource,
  ): Promise<void> {
    this.financeService = new FinanceService(dataSource.getRepository(Finance));

    await this.financeService.update(
      { financeId: options.filter.id },
      { statusId: FINANCE_STATUS.PROCESSING },
    );

    await this.payTransactionQueue?.addJob(options);
  }

  validateCreateFinance(): void {
    return;
  }

  validatePayFinance(finance: Finance): void {
    if (!finance)
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);

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

  async removeFinanceInfo(): Promise<void> {
    return Promise.resolve();
  }
}
