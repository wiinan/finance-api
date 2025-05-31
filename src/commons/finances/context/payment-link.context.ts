import { CalculateUtils } from 'src/helpers/calculate';
import {
  FinanceHandlerDto,
  FinancePayBodyDto,
  FinancePayOptionsDto,
  FinancePayRequestDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { IBaseContext, IFinanceService } from '../interfaces';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import { DataSource, EntityManager } from 'typeorm';
import { FinanceService } from '../services';
import { Finance, PaymentLinkFinanceInfo } from 'src/database/entities';
import { FinancePaymentLinkService } from '../services/finance-payment-link.service';
import { IFinancePaymentLinkService } from '../interfaces/finance-payment-link.interface';
import {
  FINANCE_STATUS,
  PAYMENT_METHODS,
} from 'src/constants/finance.constants';
import { HttpException, HttpStatus } from '@nestjs/common';
import { QueueProducerService } from 'src/workers/producer-queue';
import * as dayjs from 'dayjs';

export class PaymentLinkContext implements IBaseContext {
  private financeService: IFinanceService;
  private financePaymentLinkService: IFinancePaymentLinkService;

  constructor(private readonly payTransactionQueue?: QueueProducerService) {}

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { paymentLinkInfo } = data;

    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: paymentLinkInfo?.taxes || 0,
    });
    const finance = CreateFinanceHelper.normalizeFinanceData(data, liquidPrice);

    return {
      finance,
      paymentLinkInfo,
      userBalance: CreateFinanceHelper.getBalenceProps(finance),
    };
  }

  public async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );
    this.financePaymentLinkService = new FinancePaymentLinkService(
      transactionalEntityManager.getRepository(PaymentLinkFinanceInfo),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    if (financeHandler.paymentLinkInfo) {
      const paymentLinkData = CreateFinanceHelper.mountFinanceInfoData(
        financeHandler.paymentLinkInfo,
        financeHandler.newFinance.id,
      );

      await this.financePaymentLinkService.createPaymentLink(paymentLinkData);
    }
  }

  validateCreateFinance(data: RequestCreateFinanceDto): void {
    const { paymentLinkInfo } = data;

    if (
      data.paymentMethodId !== PAYMENT_METHODS.PAYMENT_LINK ||
      !paymentLinkInfo
    ) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  validatePayFinance(finance: Finance): void {
    if (!finance) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    if (
      [FINANCE_STATUS.CLOSED, FINANCE_STATUS.PAID].includes(finance.statusId) ||
      finance.receivedValue >= finance.liquidPrice
    )
      throw new HttpException('FINANCE_ALREADY_PAID', HttpStatus.BAD_REQUEST);

    if (
      [FINANCE_STATUS.CANCELED, FINANCE_STATUS.REFUND].includes(
        finance.statusId,
      )
    )
      throw new HttpException('FINANCE_CANNOT_BE_PAID', HttpStatus.BAD_REQUEST);
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
}
