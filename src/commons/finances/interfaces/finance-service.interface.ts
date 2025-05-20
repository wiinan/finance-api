import { Finance } from 'src/database/entities';
import {
  FinanceDto,
  listFinanceDto,
  ListFinanceFilterDto,
} from '../dtos/finance.dto';

export abstract class IFinanceService {
  abstract createFinance(data: FinanceDto): Promise<Finance>;
  abstract list(filter: ListFinanceFilterDto): Promise<listFinanceDto[]>;
}
