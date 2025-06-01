import { creditCardInfoDto } from '../dtos/finance.dto';

export abstract class IFinanceCreditcardService {
  abstract createCreditCardFinance(data: creditCardInfoDto): Promise<void>;
  abstract remove(financeId: number): Promise<boolean>;
}
