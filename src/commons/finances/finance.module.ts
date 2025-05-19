import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import {
  IBaseStrategy,
  IFinanceService,
  IInstallmentService,
  IFinancePixService,
  IFinancePaymentLinkService,
  IFinanceCreditcardService,
} from './interfaces';
import {
  FinanceService,
  InstallmentService,
  FinancePixService,
  FinancePaymentLinkService,
  FinanceCreditcardService,
} from './services';
import {
  CreditCardFinanceInfo,
  Finance,
  FinanceInstallment,
  PaymentLinkFinanceInfo,
  PixFinanceInfo,
} from 'src/database/entities';
import { CreateFinanceChain } from './chain';
import { BaseStrategy } from './context/base.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Finance,
      FinanceInstallment,
      PixFinanceInfo,
      PaymentLinkFinanceInfo,
      CreditCardFinanceInfo,
    ]),
  ],
  controllers: [FinanceController],
  providers: [
    { provide: IFinanceService, useClass: FinanceService },
    { provide: IFinancePixService, useClass: FinancePixService },
    { provide: IFinanceCreditcardService, useClass: FinanceCreditcardService },
    {
      provide: IFinancePaymentLinkService,
      useClass: FinancePaymentLinkService,
    },
    { provide: IInstallmentService, useClass: InstallmentService },
    { provide: IBaseStrategy, useClass: BaseStrategy },
    CreateFinanceChain,
  ],
  exports: [],
})
export class FinanceModule {}
