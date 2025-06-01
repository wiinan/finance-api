import { Injectable } from '@nestjs/common';
import { PaymentLinkInfoDto } from '../dtos/finance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentLinkFinanceInfo } from 'src/database/entities';
import { Repository } from 'typeorm';
import { IFinancePaymentLinkService } from '../interfaces/finance-payment-link.interface';

@Injectable()
export class FinancePaymentLinkService implements IFinancePaymentLinkService {
  constructor(
    @InjectRepository(PaymentLinkFinanceInfo)
    private readonly paymentLinkFinanceModel: Repository<PaymentLinkFinanceInfo>,
  ) {}
  async createPaymentLink(data: PaymentLinkInfoDto): Promise<void> {
    const paymentLink = this.paymentLinkFinanceModel.create(data);

    await this.paymentLinkFinanceModel.save(paymentLink);
  }

  async remove(financeId: number): Promise<boolean> {
    await this.paymentLinkFinanceModel.update(
      { financeId },
      { isDeleted: true },
    );

    return true;
  }
}
