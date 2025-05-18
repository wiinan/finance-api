import { EntityManager } from 'typeorm';
import { FinanceHandlerDto } from '../dtos/finance.dto';

export abstract class IBaseStrategy {
  abstract mountFinanceData(): FinanceHandlerDto;
  abstract executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void>;
}
