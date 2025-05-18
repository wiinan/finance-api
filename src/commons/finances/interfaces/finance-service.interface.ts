import { Finance } from 'src/database/entities';
import { FinanceDto } from '../dtos/finance.dto';

export abstract class IFinanceService {
  abstract createFinance(data: FinanceDto): Promise<Finance>;
}
