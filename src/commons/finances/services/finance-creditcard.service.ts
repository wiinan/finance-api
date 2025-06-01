import { Injectable } from '@nestjs/common';
import { IFinanceCreditcardService } from '../interfaces/finance-creditcard.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditCardFinanceInfo } from 'src/database/entities';
import { creditCardInfoDto } from '../dtos/finance.dto';
import { Repository } from 'typeorm';

@Injectable()
export class FinanceCreditcardService implements IFinanceCreditcardService {
  constructor(
    @InjectRepository(CreditCardFinanceInfo)
    private readonly creditcardModel: Repository<CreditCardFinanceInfo>,
  ) {}

  public async createCreditCardFinance(data: creditCardInfoDto): Promise<void> {
    const creditCardFinance = this.creditcardModel.create(data);

    await this.creditcardModel.save(creditCardFinance);
  }

  async remove(financeId: number): Promise<boolean> {
    await this.creditcardModel.update({ financeId }, { isDeleted: true });

    return true;
  }
}
