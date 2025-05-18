import { CalculateUtils } from 'src/helpers/calculate';
import {
  FinanceHandlerDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { IBaseContext, IFinanceService } from '../interfaces';
import { FinanceHelper } from '../helpers/finance.helpers';
import { EntityManager } from 'typeorm';
import { FinanceService } from '../services';
import { Finance, PaymentLinkFinanceInfo } from 'src/database/entities';
import { FinancePaymentLinkService } from '../services/finance-payment-link.service';
import { IFinancePaymentLinkService } from '../interfaces/finance-payment-link.interface';

export class PaymentLinkContext implements IBaseContext {
  private financeService: IFinanceService;
  private financePaymentLinkService: IFinancePaymentLinkService;

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { paymentLinkInfo } = data;

    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: paymentLinkInfo?.taxes || 0,
    });
    const finance = FinanceHelper.normalizeFinanceData(data, liquidPrice);

    return {
      finance,
      paymentLinkInfo,
      userBalance: FinanceHelper.getBalenceProps(finance),
    };
  }

  public async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );
    this.financePaymentLinkService = new FinancePaymentLinkService(
      transactionalEntityManager.getRepository(PaymentLinkFinanceInfo),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    if (financeHandler.paymentLinkInfo) {
      const paymentLinkData = FinanceHelper.mountFinanceInfoData(
        financeHandler.paymentLinkInfo,
        financeHandler.newFinance.id,
      );

      await this.financePaymentLinkService.createPaymentLink(paymentLinkData);
    }
  }
}
