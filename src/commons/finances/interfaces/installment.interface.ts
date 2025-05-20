import { FinanceInstallment } from 'src/database/entities';
import {
  FinanceInstallmentsDto,
  ListFinanceFilterDto,
} from '../dtos/finance.dto';

export abstract class IInstallmentService {
  abstract createInstallment(data: FinanceInstallmentsDto[]): Promise<void>;
  abstract list(filter: ListFinanceFilterDto): Promise<FinanceInstallment[]>;
}
