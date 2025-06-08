import { DataSource, EntityManager } from 'typeorm';
import {
  FinancePayOptionsDto,
  FinancePayRequestDto,
} from '../dtos/finance.dto';
import { BaseStrategy } from '../context/base.strategy';
import { IFinanceService } from '../interfaces';
import { FinanceService } from '../services';
import { Finance, User } from 'src/database/entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserBalanceDto } from 'src/commons/users/dtos/user.dto';
import { UserService } from 'src/commons/users/user.service';
import { IUserService } from 'src/commons/users/interfaces/user.interface';
import { QueueProducerService } from 'src/workers/producer-queue';

@Injectable()
export class PayFinanceChain {
  private financeService: IFinanceService;
  private userService: IUserService;

  constructor(
    private readonly dataSource: DataSource,
    private readonly payTransactionQueue: QueueProducerService,
  ) {}

  private async updateUserBalance(
    userId: number,
    userBalance: UserBalanceDto,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    const userModule = transactionalEntityManager.getRepository(User);
    this.userService = new UserService(userModule);

    await this.userService.updateUserBalance({ id: userId }, userBalance);
  }

  private async getStrategyContext({ data, filter }: FinancePayRequestDto) {
    this.financeService = new FinanceService(
      this.dataSource.getRepository(Finance),
    );

    const currentFinance = await this.financeService.findFinance({
      id: filter.id,
      installment: data.installment,
    });

    if (!currentFinance) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const strategyContext = new BaseStrategy(
      currentFinance.paymentMethodId,
      this.payTransactionQueue,
    );

    strategyContext.validatePayFinance(currentFinance);

    return { strategyContext, currentFinance };
  }

  public async executePayTransactions({
    data,
    filter,
  }: FinancePayRequestDto): Promise<void> {
    const { strategyContext, currentFinance } = await this.getStrategyContext({
      data,
      filter,
    });

    const financeHandler: FinancePayOptionsDto =
      strategyContext.mountFinancePayData(currentFinance, data);

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await Promise.all([
        this.updateUserBalance(
          currentFinance.userId,
          financeHandler.userBalance,
          transactionalEntityManager,
        ),
        strategyContext.executePayTransactions(
          transactionalEntityManager,
          financeHandler,
        ),
      ]);
    });
  }

  public async run({ data, filter }: FinancePayRequestDto): Promise<boolean> {
    const { strategyContext, currentFinance } = await this.getStrategyContext({
      data,
      filter,
    });

    const financeInstallment = currentFinance.installment?.find(
      (installment) => installment.installment === data.installment,
    );

    await strategyContext.savePayFinances(
      { data, filter: { ...filter, installmentId: financeInstallment?.id } },
      this.dataSource,
    );

    return true;
  }
}
