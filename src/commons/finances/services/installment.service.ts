import { Injectable } from '@nestjs/common';
import {
  FinanceInstallmentsDto,
  FinancePayFilterDto,
  FindFinanceParams,
  ListFinanceFilterDto,
  UpdateFinanceBodyDto,
} from '../dtos/finance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FinanceInstallment } from 'src/database/entities';
import { Repository } from 'typeorm';
import { IInstallmentService } from '../interfaces/installment.interface';
import { FinanceHelper } from '../helpers/finance.helpers';

@Injectable()
export class InstallmentService implements IInstallmentService {
  constructor(
    @InjectRepository(FinanceInstallment)
    private readonly financeInstallmentModel: Repository<FinanceInstallment>,
  ) {}
  async createInstallment(data: FinanceInstallmentsDto[]): Promise<void> {
    await this.financeInstallmentModel
      .createQueryBuilder()
      .insert()
      .into(FinanceInstallment)
      .values(data)
      .execute();
  }

  async list(filter: ListFinanceFilterDto): Promise<FinanceInstallment[]> {
    const whereOptions = FinanceHelper.getFinanceFilters<FinanceInstallment>({
      ...filter,
      typeId: undefined,
    });

    if (filter.typeId) {
      whereOptions.finance = { typeId: filter.typeId };
    }

    return this.financeInstallmentModel.find({
      where: whereOptions,
      relations: [
        'paymentMethod',
        'financeStatus',
        'finance.type',
        'finance.user',
        'finance.pixInfo',
        'finance.creditCardInfo',
        'finance.paymentLinkInfo',
      ],
      select: {
        id: true,
        financeId: true,
        price: true,
        liquidPrice: true,
        receivedValue: true,
        competence: true,
        createdAt: true,
        paidAt: true,
        installments: true,
        installment: true,
        paymentMethod: {
          name: true,
        },
        financeStatus: {
          name: true,
        },
      },
    });
  }

  async find(filter: FindFinanceParams): Promise<FinanceInstallment | null> {
    return this.financeInstallmentModel.findOne({
      where: filter,
      relations: ['finance'],
      select: {
        id: true,
        financeId: true,
        liquidPrice: true,
        receivedValue: true,
        paidAt: true,
        installments: true,
        installment: true,
        paymentMethodId: true,
        userId: true,
        statusId: true,
        finance: {
          receivedValue: true,
        },
      },
    });
  }

  async update(
    filter: FinancePayFilterDto,
    data: UpdateFinanceBodyDto,
  ): Promise<boolean> {
    await this.financeInstallmentModel
      .createQueryBuilder()
      .update(FinanceInstallment)
      .set(data)
      .where('id = :installmentId', { filter })
      .execute();

    return true;
  }
}
