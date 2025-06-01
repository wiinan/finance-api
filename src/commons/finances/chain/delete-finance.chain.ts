import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { IFinanceService, IInstallmentService } from '../interfaces';
import { IUserService } from 'src/commons/users/interfaces/user.interface';
import { FinanceService, InstallmentService } from '../services';
import { Finance, FinanceInstallment, User } from 'src/database/entities';
import { BaseStrategy } from '../context/base.strategy';
import { FinancePayParamsDto } from '../dtos/finance.dto';
import { FinanceHelper } from '../helpers/finance.helpers';
import { UserBalanceDto } from 'src/commons/users/dtos/user.dto';
import { UserService } from 'src/commons/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';

@Injectable()
export class DeleteFinanceChain {
  private financeService: IFinanceService;
  private installmentService: IInstallmentService;
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

  async run(filter: FinancePayParamsDto) {
    this.financeService = new FinanceService(
      this.dataSource.getRepository(Finance),
    );

    const currentFinance = await this.financeService.findFinance({
      id: filter.id,
    });

    if (!currentFinance) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    FinanceHelper.validateFinanceToRemove(currentFinance);

    const strategyContext = new BaseStrategy(currentFinance.paymentMethodId);

    const promises: Promise<any>[] = [];
    const userBalance = CreateFinanceHelper.getBalenceProps({
      liquidPrice: -currentFinance.liquidPrice,
      typeId: currentFinance.typeId,
    });

    await this.dataSource?.transaction(async (transactionalEntityManager) => {
      promises.push(
        strategyContext.removeFinanceInfo(
          currentFinance.id,
          transactionalEntityManager,
        ),
        this.financeService.update(
          { financeId: filter.id },
          { isDeleted: true },
        ),
        this.updateUserBalance(
          currentFinance.userId,
          userBalance,
          transactionalEntityManager,
        ),
      );

      if (currentFinance.installments) {
        this.installmentService = new InstallmentService(
          transactionalEntityManager.getRepository(FinanceInstallment),
        );

        promises.push(
          this.installmentService.removeInstallments({
            financeId: filter.id,
          }),
        );
      }

      await Promise.all(promises);
    });

    return true;
  }
}
