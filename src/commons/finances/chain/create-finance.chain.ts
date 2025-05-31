import { Injectable } from '@nestjs/common';
import { RequestCreateFinanceDto } from '../dtos/finance.dto';
import { BaseStrategy } from '../context/base.strategy';
import { Finance, User } from 'src/database/entities';
import { DataSource, EntityManager } from 'typeorm';
import { UserBalanceDto } from 'src/commons/users/dtos/user.dto';
import { UserService } from 'src/commons/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { IUserService } from 'src/commons/users/interfaces/user.interface';
import { FINANCE_STATUS } from 'src/constants/finance.constants';

@Injectable()
export class CreateFinanceChain {
  private userService: IUserService;

  constructor(private readonly dataSource: DataSource) {}

  private async updateUserBalance(
    userId: number,
    userBalance: UserBalanceDto,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    const userModule = transactionalEntityManager.getRepository(User);
    this.userService = new UserService(userModule, new JwtService());

    await this.userService.updateUserBalance({ id: userId }, userBalance);
  }

  public async run(options: RequestCreateFinanceDto): Promise<Finance> {
    const data = {
      ...options,
      statusId: FINANCE_STATUS.OPEN,
    };
    const strategyContext = new BaseStrategy(data.paymentMethodId);

    strategyContext.validateCreateFinance(data);

    const financeHandler = strategyContext.mountFinanceData(data);

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await Promise.all([
        this.updateUserBalance(
          options.userId,
          financeHandler.userBalance,
          transactionalEntityManager,
        ),
        strategyContext.executeTransactions(
          transactionalEntityManager,
          financeHandler,
        ),
      ]);
    });

    return financeHandler.newFinance as Finance;
  }
}
