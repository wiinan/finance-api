import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateFinanceHelper } from 'src/commons/finances/helpers/create-finance.helpers';
import { IUserService } from 'src/commons/users/interfaces/user.interface';

@Injectable()
export class CronJobUser {
  private readonly logger = new Logger(CronJobUser.name);
  constructor(private readonly userService: IUserService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('User Cronjob started');

    try {
      const [incomeAndExpenseBalanceData, receivedBalanceData] =
        await Promise.all([
          this.userService.getUserIncomeAndExpenseBalances(),
          this.userService.getUserReceivedValueBalance(),
        ]);

      const balancesToUpdate = [
        ...incomeAndExpenseBalanceData,
        ...receivedBalanceData,
      ].filter((balance) => balance.hasUpdateBalance);

      const promises = balancesToUpdate.map(async (balance) => {
        const userBalance = CreateFinanceHelper.getBalenceProps(balance);

        return this.userService.update({ id: balance.userId }, userBalance);
      });

      await Promise.all(promises);

      this.logger.debug('User Cronjob Finished with success', balancesToUpdate);
    } catch (error) {
      this.logger.debug('User Cronjob Finished with error', error);
    }
  }
}
