import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import {
  IBaseStrategy,
  IFinanceService,
  IInstallmentService,
} from './interfaces';
import { FinanceService, InstallmentService } from './services';
import {
  Finance,
  FinanceInstallment,
  PaymentLinkFinanceInfo,
  PixFinanceInfo,
} from 'src/database/entities';
import { CreateFinanceChain } from './chain';
import { BaseStrategy } from './context/base.strategy';
import { IFinancePaymentLinkService } from './interfaces/finance-payment-link.interface';
import { FinancePaymentLinkService } from './services/finance-payment-link.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Finance,
      FinanceInstallment,
      PixFinanceInfo,
      PaymentLinkFinanceInfo,
    ]),
  ],
  controllers: [FinanceController],
  providers: [
    { provide: IFinanceService, useClass: FinanceService },
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
