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
import { PayFinanceChain } from './chain/pay-finance-chain';
import { QueueProducerService } from '../../workers/producer-queue';
import { BullModule } from '@nestjs/bullmq';
import { TANSACTION_QUEUE } from 'src/constants/finance.constants';
import { CronJobFinance } from 'src/crons/finance.cron';
import { DeleteFinanceChain } from './chain/delete-finance.chain';
import { FinanceProcessQueue } from 'src/workers/queue-finance-stream';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Finance,
      FinanceInstallment,
      PixFinanceInfo,
      PaymentLinkFinanceInfo,
      CreditCardFinanceInfo,
    ]),
    BullModule.registerQueue({
      name: TANSACTION_QUEUE.PAY,
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? ~~process.env.REDIS_PORT : 6379,
      },
    }),
  ],
  controllers: [FinanceController],
  providers: [
    QueueProducerService,
    FinanceProcessQueue,
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
    PayFinanceChain,
    DeleteFinanceChain,
    CronJobFinance,
  ],
  exports: [],
})
export class FinanceModule {}
