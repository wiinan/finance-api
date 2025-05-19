import { Injectable } from '@nestjs/common';
import { FinanceInstallmentsDto } from '../dtos/finance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FinanceInstallment } from 'src/database/entities';
import { Repository } from 'typeorm';
import { IInstallmentService } from '../interfaces/installment.interface';

@Injectable()
export class InstallmentService implements IInstallmentService {
  constructor(
    @InjectRepository(FinanceInstallment)
    private readonly financeInstalmentModel: Repository<FinanceInstallment>,
  ) {}
  async createInstallment(data: FinanceInstallmentsDto[]): Promise<void> {
    await this.financeInstalmentModel
      .createQueryBuilder()
      .insert()
      .into(FinanceInstallment)
      .values(data)
      .execute();
  }
}
