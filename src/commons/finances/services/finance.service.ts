import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Finance, FinanceInstallment } from 'src/database/entities';
import { IsNull, Repository } from 'typeorm';
import {
  FinanceDto,
  FinancePayFilterDto,
  FindFinanceParams,
  listFinanceDto,
  ListFinanceFilterDto,
  UpdateFinanceBodyDto,
} from '../dtos/finance.dto';
import { IFinanceService, IInstallmentService } from '../interfaces';
import { FinanceHelper } from '../helpers/finance.helpers';
import { FINANCE_STATUS } from 'src/constants/finance.constants';

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

  private async find(id: number): Promise<Finance | null> {
    return this.financeModel.findOne({
      where: { id },
      select: {
        id: true,
        liquidPrice: true,
        receivedValue: true,
        paidAt: true,
        paymentMethodId: true,
        statusId: true,
        userId: true,
      },
    });
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

  async findFinance(
    filter: FindFinanceParams,
  ): Promise<Finance | FinanceInstallment | null> {
    if (filter.installment && this.installmentService) {
      return this.installmentService?.find(filter);
    }

    return this.find(filter.id);
  }

  async update(
    filter: FinancePayFilterDto,
    data: UpdateFinanceBodyDto,
  ): Promise<boolean> {
    await this.financeModel
      .createQueryBuilder()
      .update(Finance)
      .set(data)
      .where('id = :financeId', filter)
      .execute();

    return true;
  }

  async resetFinanceTrasaction(): Promise<boolean> {
    await this.financeModel
      .createQueryBuilder()
      .update(Finance)
      .set({ statusId: FINANCE_STATUS.CANCELED })
      .where('statusId = :statusId', { statusId: FINANCE_STATUS.PROCESSING })
      .execute();

    return true;
  }
}
