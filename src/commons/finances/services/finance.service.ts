import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Finance } from 'src/database/entities';
import { Repository } from 'typeorm';
import { FinanceDto } from '../dtos/finance.dto';
import { IFinanceService } from '../interfaces';

@Injectable()
export class FinanceService implements IFinanceService {
  constructor(
    @InjectRepository(Finance)
    private readonly financeModel: Repository<Finance>,
  ) {}
  async createFinance(data: FinanceDto): Promise<Finance> {
    const financeData = this.financeModel.create(data);

    await this.financeModel.save(financeData);

    return financeData;
  }
}
