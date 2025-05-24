import { Finance, FinanceInstallment } from 'src/database/entities';
import {
  FinanceDto,
  FinancePayFilterDto,
  FindFinanceParams,
  listFinanceDto,
  ListFinanceFilterDto,
  UpdateFinanceBodyDto,
} from '../dtos/finance.dto';

export abstract class IFinanceService {
  abstract createFinance(data: FinanceDto): Promise<Finance>;
  abstract list(filter: ListFinanceFilterDto): Promise<listFinanceDto[]>;
  abstract update(
    filter: FinancePayFilterDto,
    data: UpdateFinanceBodyDto,
  ): Promise<boolean>;
  abstract findFinance(
    filter: FindFinanceParams,
  ): Promise<Finance | FinanceInstallment | null>;
  abstract resetFinanceTrasaction(): Promise<boolean>;
}
