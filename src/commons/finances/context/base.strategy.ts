import { PAYMENT_METHODS } from 'src/constants/finance.constants';
import {
  FinanceHandlerDto,
  FinancePayBodyDto,
  FinancePayOptionsDto,
  FinancePayRequestDto,
  PaymetMethodIdsDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import {
  BaseContext,
  CreditCardContext,
  PaymentLinkContext,
  PixContext,
} from './';
import { IBaseContext, IBaseStrategy } from '../interfaces';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { InstallmentContext } from './installment.context';
import { Finance, FinanceInstallment } from 'src/database/entities';
import { QueueProducerService } from 'src/workers/producer-queue';

Injectable();
export class BaseStrategy implements IBaseStrategy {
  private strategy: IBaseContext;

  constructor(
    private readonly paymentMethodId: PaymetMethodIdsDto,
    private readonly payTransactionQueue?: QueueProducerService,
  ) {
    const paymentContextById = {
      [PAYMENT_METHODS.PIX]: PixContext,
      [PAYMENT_METHODS.CREDIT_CARD]: CreditCardContext,
      [PAYMENT_METHODS.TRANFER]: BaseContext,
      [PAYMENT_METHODS.PAYMENT_LINK]: PaymentLinkContext,
      [PAYMENT_METHODS.INSTALLMENT]: InstallmentContext,
    };

    const strategyClass =
      paymentContextById[this.paymentMethodId] || BaseContext;

    this.strategy = new strategyClass(this.payTransactionQueue);
  }

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    return this.strategy.mountFinanceData(data);
  }

  mountFinancePayData(
    currentFinance: Finance | FinanceInstallment,
    data: FinancePayBodyDto,
  ): FinancePayOptionsDto {
    return this.strategy.mountFinancePayData(currentFinance, data);
  }

  async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    return await this.strategy.executeTransactions(
      transactionalEntityManager,
      financeHandler,
    );
  }

  async executePayTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinancePayOptionsDto,
  ): Promise<void> {
    return await this.strategy.executePayTransactions(
      transactionalEntityManager,
      financeHandler,
    );
  }

  async savePayFinances(
    options: FinancePayRequestDto,
    dataSource: DataSource,
  ): Promise<void> {
    return await this.strategy.savePayFinances(options, dataSource);
  }

  validateCreateFinance(data: RequestCreateFinanceDto): void {
    this.strategy.validateCreateFinance(data);
  }

  validatePayFinance(finance: Finance | FinanceInstallment): void {
    this.strategy.validatePayFinance(finance);
  }

  async removeFinanceInfo(
    financeId: number,
    entityManager: EntityManager,
  ): Promise<void> {
    await this.strategy.removeFinanceInfo(financeId, entityManager);
  }
}
