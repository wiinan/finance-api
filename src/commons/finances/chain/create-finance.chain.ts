import { Injectable } from '@nestjs/common';
import { RequestCreateFinanceDto } from '../dtos/finance.dto';
import { BaseStrategy } from '../context/base.strategy';
import { Finance, User } from 'src/database/entities';
import { DataSource, EntityManager } from 'typeorm';
import { UserBalanceDto } from 'src/commons/users/dtos/user.dto';
import { UserService } from 'src/commons/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { IUserService } from 'src/commons/users/interfaces/user.interface';

@Injectable()
export class CreateFinanceChain {
  private userService: IUserService;

  constructor(private readonly dataSource: DataSource) {}

  public async run(options: RequestCreateFinanceDto): Promise<Finance> {
    const strategyContext = new BaseStrategy(options);
    const financeHandler = strategyContext.mountFinanceData();

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

  private async updateUserBalance(
    userId: number,
    userBalance: UserBalanceDto,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    const userModule = transactionalEntityManager.getRepository(User);
    this.userService = new UserService(userModule, new JwtService());

    await this.userService.updateUserBalance({ id: userId }, userBalance);
  }
}
