import { PAYMENT_METHODS } from 'src/constants/finance.constants';
import {
  FinanceHandlerDto,
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
import { EntityManager } from 'typeorm';
import { InstallmentContext } from './installment.context';

Injectable();
export class BaseStrategy implements IBaseStrategy {
  private strategy: IBaseContext;

  constructor(private readonly data: RequestCreateFinanceDto) {
    const paymentMethodId = this.data?.paymentMethodId;
    const paymentContextById = {
      [PAYMENT_METHODS.PIX]: PixContext,
      [PAYMENT_METHODS.CREDIT_CARD]: CreditCardContext,
      [PAYMENT_METHODS.TRANFER]: BaseContext,
      [PAYMENT_METHODS.PAYMENT_LINK]: PaymentLinkContext,
      [PAYMENT_METHODS.INSTALLMENT]: InstallmentContext,
    };

    const strategyClass = paymentContextById[paymentMethodId] || BaseContext;

    this.strategy = new strategyClass();
  }

  mountFinanceData(): FinanceHandlerDto {
    return this.strategy.mountFinanceData(this.data);
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

  validateCreateFinance(): void {
    this.strategy.validateCreateFinance(this.data);
  }
}
