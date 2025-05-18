import { FinanceInstallmentsDto } from '../dtos/finance.dto';

export abstract class IInstallmentService {
  abstract createInstallment(data: FinanceInstallmentsDto[]): Promise<void>;
}
