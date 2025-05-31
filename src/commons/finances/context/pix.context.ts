import { CalculateUtils } from 'src/helpers/calculate';
import {
  FinanceHandlerDto,
  FinancePayBodyDto,
  FinancePayOptionsDto,
  FinancePayRequestDto,
  PayFinanceDataDto,
  RequestCreateFinanceDto,
} from '../dtos/finance.dto';
import { CreateFinanceHelper } from '../helpers/create-finance.helpers';
import {
  IBaseContext,
  IFinanceService,
  IInstallmentService,
  IFinancePixService,
} from '../interfaces';
import { DataSource, EntityManager } from 'typeorm';
import {
  FinancePixService,
  FinanceService,
  InstallmentService,
} from '../services';
import {
  Finance,
  FinanceInstallment,
  PixFinanceInfo,
} from 'src/database/entities';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  FINANCE_STATUS,
  PAYMENT_METHODS,
} from 'src/constants/finance.constants';
import { QueueProducerService } from 'src/workers/producer-queue';
import * as dayjs from 'dayjs';
import { first } from 'lodash';

export class PixContext implements IBaseContext {
  private financeService: IFinanceService;
  private financePixService: IFinancePixService;
  private installmentService: IInstallmentService;

  constructor(private readonly payTransactionQueue?: QueueProducerService) {}

  mountFinanceData(data: RequestCreateFinanceDto): FinanceHandlerDto {
    const { additionalOptions, pixInfo } = data;

    const totalTaxes = CalculateUtils.sumValues([
      additionalOptions?.taxes || 0,
      pixInfo?.taxes || 0,
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
      pixInfo: { ...pixInfo, userId: data.userId },
      userBalance: CreateFinanceHelper.getBalenceProps(finance),
      additionalOptions,
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
    this.financePixService = new FinancePixService(
      transactionalEntityManager.getRepository(PixFinanceInfo),
    );

    financeHandler.newFinance = await this.financeService.createFinance(
      financeHandler.finance,
    );

    const promises: Promise<any>[] = [];

    if (financeHandler.pixInfo) {
      const pixData = CreateFinanceHelper.mountFinanceInfoData(
        financeHandler.pixInfo,
        financeHandler.newFinance.id,
      );

      promises.push(this.financePixService.createPix(pixData));
    }

    if (financeHandler.additionalOptions) {
      const financeInstallments = CreateFinanceHelper.mountFinanceInstallments(
        financeHandler.newFinance,
        financeHandler.additionalOptions,
      );
      this.installmentService = new InstallmentService(
        transactionalEntityManager.getRepository(FinanceInstallment),
      );

      promises.push(
        this.installmentService.createInstallment(financeInstallments),
      );
    }

    await Promise.all(promises);
  }

  validateCreateFinance(data: RequestCreateFinanceDto): void {
    const { pixInfo } = data;

    if (data.paymentMethodId !== PAYMENT_METHODS.PIX || !pixInfo) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  validatePayFinance(currentFinance: Finance): void {
    if (
      !currentFinance ||
      currentFinance.paymentMethodId !== PAYMENT_METHODS.PIX
    ) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const finance = first(currentFinance.installment) || currentFinance;

    if (
      [FINANCE_STATUS.CLOSED, FINANCE_STATUS.PAID].includes(finance.statusId) ||
      finance.receivedValue >= finance.liquidPrice
    )
      throw new HttpException('FINANCE_ALREADY_PAID', HttpStatus.BAD_REQUEST);

    if (
      [FINANCE_STATUS.CANCELED, FINANCE_STATUS.REFUND].includes(
        finance.statusId,
      )
    )
      throw new HttpException('FINANCE_CANNOT_BE_PAID', HttpStatus.BAD_REQUEST);
  }

  mountFinancePayData(
    currentFinance: Finance,
    data: FinancePayBodyDto,
  ): FinancePayOptionsDto {
    const financeInstallment = currentFinance.installment?.find(
      (installment) => installment.installment === data.installment,
    );

    const financeReceivedValue = CalculateUtils.sumValues([
      currentFinance.receivedValue,
      data.receivedValue,
    ]);

    const paidAt = dayjs().toDate();
    const financeData: PayFinanceDataDto = {
      receivedValue: financeReceivedValue,
      statusId: CreateFinanceHelper.getFinanceStatus(
        financeReceivedValue,
        currentFinance.liquidPrice,
      ),
    };

    if (!financeInstallment) {
      financeData.paidAt = paidAt;
      financeData.payerInfo = data.payerInfo;
    }

    const optionsHandler: FinancePayOptionsDto = {
      userBalance: CreateFinanceHelper.getBalenceProps(data),
      filter: {
        userId: currentFinance.userId,
        financeId: currentFinance.id,
        installment: financeInstallment?.installment,
        installmentId: financeInstallment?.id,
      },
      finance: financeData,
    };

    if (financeInstallment) {
      optionsHandler.financeInstallment = {
        paidAt,
        payerInfo: data.payerInfo,
        statusId: CreateFinanceHelper.getFinanceStatus(
          data.receivedValue,
          ~~financeInstallment?.liquidPrice || 0,
        ),
        receivedValue: CalculateUtils.sumValues([
          ~~financeInstallment?.receivedValue || 0,
          data.receivedValue,
        ]),
      };
    }

    return optionsHandler;
  }

  public async executePayTransactions(
    transactionalEntityManager: EntityManager,
    financeHandler: FinancePayOptionsDto,
  ): Promise<void> {
    this.financeService = new FinanceService(
      transactionalEntityManager.getRepository(Finance),
    );

    const promises = [
      this.financeService.update(financeHandler.filter, financeHandler.finance),
    ];

    if (financeHandler.financeInstallment) {
      this.installmentService = new InstallmentService(
        transactionalEntityManager.getRepository(FinanceInstallment),
      );

      promises.push(
        this.installmentService.update(
          financeHandler.filter,
          financeHandler.financeInstallment,
        ),
      );
    }

    await Promise.all(promises);
  }

  public async savePayFinances(
    options: FinancePayRequestDto,
    dataSource: DataSource,
  ): Promise<void> {
    if (options.data.installment) {
      this.installmentService = new InstallmentService(
        dataSource.getRepository(FinanceInstallment),
      );

      await this.installmentService.update(
        {
          installmentId: options.filter.installmentId,
        },
        { statusId: FINANCE_STATUS.PROCESSING },
      );
    } else {
      this.financeService = new FinanceService(
        dataSource.getRepository(Finance),
      );

      await this.financeService.update(
        { financeId: options.filter.id },
        { statusId: FINANCE_STATUS.PROCESSING },
      );
    }

    await this.payTransactionQueue?.addJob(options);
  }
}
