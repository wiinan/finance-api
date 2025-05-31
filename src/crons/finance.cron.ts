import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IFinanceService,
  IInstallmentService,
} from 'src/commons/finances/interfaces';

@Injectable()
export class CronJobFinance {
  private readonly logger = new Logger(CronJobFinance.name);
  constructor(
    private readonly financeService: IFinanceService,
    private readonly installmentService: IInstallmentService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Finance Cronjob Started');

    try {
      await Promise.all([
        this.financeService.resetFinanceTrasaction(),
        this.installmentService.resetInstallmentTrasaction(),
      ]);
      this.logger.debug('Finance Cronjob Finished with success');
    } catch (error) {
      this.logger.debug('Finance Cronjob Finished with error', error);
    }
  }
}
