import { EntityManager } from 'typeorm';
import {
  FinanceHandlerDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';

export abstract class IBaseContext {
  abstract mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto;
  abstract executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void>;
  abstract validateCreateFinance(data: RequestCreateFinanceDto): void;
}
