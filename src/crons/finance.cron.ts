import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IFinanceService } from 'src/commons/finances/interfaces';

@Injectable()
export class CronJobFinance {
  private readonly logger = new Logger(CronJobFinance.name);
  constructor(private readonly financeService: IFinanceService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Finance Cronjob Started');

    try {
      await this.financeService.resetFinanceTrasaction();
      this.logger.debug('Finance Cronjob Finished with success');
    } catch (error) {
      this.logger.debug('Finance Cronjob Finished with error', error);
    }
  }
}
