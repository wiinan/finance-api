import { DataSource, EntityManager } from 'typeorm';
import {
  FinanceHandlerDto,
  FinancePayBodyDto,
  FinancePayOptionsDto,
  FinancePayRequestDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { Finance, FinanceInstallment } from 'src/database/entities';

export abstract class IBaseContext {
  abstract mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto;
  abstract mountFinancePayData(
    currentFinance: Finance | FinanceInstallment,
    data: FinancePayBodyDto,
  ): FinancePayOptionsDto;
  abstract executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void>;
  abstract executePayTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinancePayOptionsDto,
  ): Promise<void>;
  abstract savePayFinances(
    options: FinancePayRequestDto,
    dataSource: DataSource,
  ): Promise<void>;
  abstract validateCreateFinance(data: RequestCreateFinanceDto): void;
  abstract validatePayFinance(
    currentFinance: Finance | FinanceInstallment,
  ): void;
}
