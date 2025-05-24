import { CalculateUtils } from 'src/helpers/calculate';
import {
  FinanceHandlerDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import {
  IBaseContext,
  IFinanceService,
  IInstallmentService,
} from '../interfaces';
import {
  FinanceCreditcardService,
  FinanceService,
  InstallmentService,
} from '../services';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import {
  CreditCardFinanceInfo,
  Finance,
  FinanceInstallment,
} from 'src/database/entities';
import { EntityManager } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PAYMENT_METHODS } from 'src/constants/finance.constants';
import { QueueProducerService } from 'src/workers/producer-queue';

export class CreditCardContext implements IBaseContext {
  private financeService: IFinanceService;
  private financecreditCardService: FinanceCreditcardService;
  private installmentService: IInstallmentService;

  constructor(private readonly payTransactionQueue?: QueueProducerService) {}

  public mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions, creditCardInfo } = data;

    const totalTaxes = CalculateUtils.sumValues([
      additionalOptions?.taxes || 0,
      creditCardInfo?.taxes || 0,
    ]);
    const liquidPrice = CalculateUtils.calculatePercentual({
      value: data.price,
      percentage: totalTaxes,
    });

    const finance = CreateFinanceHelper.normalizeFinanceData(
      data,
      liquidPrice,
      additionalOptions?.installments,
    );

    const options: FinanceHandlerDto = {
      finance,
      additionalOptions,
      creditCardInfo: { ...creditCardInfo, userId: data.userId },
      userBalance: CreateFinanceHelper.getBalenceProps(finance),
    };

    return options;
  }

  public async executeTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinanceHandlerDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );
    this.financecreditCardService = new FinanceCreditcardService(
      transactionalEntityManager.getRepository(CreditCardFinanceInfo),
    );
    this.installmentService = new InstallmentService(
      transactionalEntityManager.getRepository(FinanceInstallment),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    const promises: Promise<any>[] = [];

    if (financeHandler.creditCardInfo) {
      const creditcardFinance = CreateFinanceHelper.mountFinanceInfoData(
        financeHandler.creditCardInfo,
        financeHandler.newFinance.id,
      );

      promises.push(
        this.financecreditCardService.createCreditCardFinance(
          creditcardFinance,
        ),
      );
    }

    if (financeHandler?.additionalOptions) {
      const creditCardFinance = CreateFinanceHelper.mountFinanceInstallments(
        financeHandler.newFinance,
        financeHandler.additionalOptions,
      );

      promises.push(
        this.installmentService.createInstallment(creditCardFinance),
      );
    }

    await Promise.all(promises);
  }

  validateCreateFinance(data: RequestCreateFinanceDto): void {
    const { additionalOptions, creditCardInfo } = data;

    if (
      data.paymentMethodId !== PAYMENT_METHODS.CREDIT_CARD ||
      !additionalOptions?.installments ||
      !data.installments ||
      !creditCardInfo
    ) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  validatePayFinance(currentFinance: Finance): void {
    if (!currentFinance) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  mountFinancePayData;
  executePayTransactions;
  savePayFinances;
}
