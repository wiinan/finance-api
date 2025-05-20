import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Finance, FinanceInstallment } from 'src/database/entities';
import { IsNull, Repository } from 'typeorm';
import {
  FinanceDto,
  listFinanceDto,
  ListFinanceFilterDto,
} from '../dtos/finance.dto';
import { IFinanceService, IInstallmentService } from '../interfaces';
import { FinanceHelper } from '../helpers/finance.helpers';

@Injectable()
export class FinanceService implements IFinanceService {
  constructor(
    @InjectRepository(Finance)
    private readonly financeModel: Repository<Finance>,
    private readonly installmentService?: IInstallmentService,
  ) {}

  async createFinance(data: FinanceDto): Promise<Finance> {
    const financeData = this.financeModel.create(data);

    await this.financeModel.save(financeData);

    return financeData;
  }

  private async listFinances(filter: ListFinanceFilterDto): Promise<Finance[]> {
    const whereOptions = FinanceHelper.getFinanceFilters<Finance>({
      ...filter,
      installments: IsNull(),
    });

    return this.financeModel.find({
      where: whereOptions,
      relations: [
        'user',
        'type',
        'paymentMethod',
        'financeStatus',
        'creditCardInfo',
        'pixInfo',
        'paymentLinkInfo',
      ],
      select: {
        id: true,
        price: true,
        liquidPrice: true,
        receivedValue: true,
        competence: true,
        createdAt: true,
        paidAt: true,
        installments: true,
        user: {
          id: true,
          name: true,
        },
        type: {
          description: true,
        },
        paymentMethod: {
          name: true,
        },
        financeStatus: {
          name: true,
        },
        creditCardInfo: {
          name: true,
          taxes: true,
        },
        pixInfo: {
          key: true,
          taxes: true,
        },
        paymentLinkInfo: {
          link: true,
        },
      },
    });
  }

  async list(filter: ListFinanceFilterDto): Promise<listFinanceDto[]> {
    const promises: Promise<Finance[] | FinanceInstallment[]>[] = [];

    promises.push(this.listFinances(filter));

    if (this.installmentService) {
      promises.push(this.installmentService.list(filter));
    }

    const [finances, installments] = (await Promise.all(promises)) as [
      Finance[],
      FinanceInstallment[] | undefined,
    ];

    return FinanceHelper.mountListFinances(finances, installments || []);
  }
}
