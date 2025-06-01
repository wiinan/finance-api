import { FinanceInstallment } from 'src/database/entities';
import {
  FinanceInstallmentsDto,
  FinancePayFilterDto,
  FindFinanceParams,
  ListFinanceFilterDto,
  UpdateFinanceBodyDto,
} from '../dtos/finance.dto';

export abstract class IInstallmentService {
  abstract createInstallment(data: FinanceInstallmentsDto[]): Promise<void>;
  abstract list(filter: ListFinanceFilterDto): Promise<FinanceInstallment[]>;
  abstract find(filter: FindFinanceParams): Promise<FinanceInstallment | null>;
  abstract update(
    filter: FinancePayFilterDto,
    data: UpdateFinanceBodyDto,
  ): Promise<boolean>;
  abstract resetInstallmentTrasaction(): Promise<boolean>;
  abstract removeInstallments(filter: FinancePayFilterDto): Promise<boolean>;
}
