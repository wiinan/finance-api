import { UserBalanceDto } from 'src/commons/users/dtos/user.dto';
import { Finance, FinanceInstallment } from 'src/database/entities';
import { FindOperator } from 'typeorm';

export type PercentageOptionsDto = {
  value: number;
  percentage: number;
  precision?: number;
};

export type PaymetMethodIdsDto = 1 | 2 | 3 | 4 | 6;

export type PixInfoDto = {
  type?: string;
  key?: string;
  taxes?: number;
  qrCode?: string;
  userId?: number;
};

export type PaymentLinkInfoDto = {
  link?: string;
  taxes?: number;
};

export type creditCardInfoDto = {
  name?: string;
  titleName?: string;
  number?: string;
  cvv?: string;
  dueDate?: string;
  taxes?: number;
  userId?: number;
};

export type FinanceInfosDto = {
  creditCardInfo?: creditCardInfoDto;
  pixInfo?: PixInfoDto;
  paymentLinkInfo?: PaymentLinkInfoDto;
};

export type FinanceDto = {
  id?: number;
  price: number;
  description: string;
  competence: Date;
  typeId: number;
  statusId: number;
  paymentMethodId: PaymetMethodIdsDto;
  userId: number;
  liquidPrice?: number;
  installments?: number;
  receivedValue?: number;
};

export type listFinanceDto = {
  id: number;
  installmentId?: number;
  price: number;
  liquidPrice: number;
  description?: string;
  competence: Date;
  type: string;
  status: string;
  paymentMethod: string;
  totalTaxes?: number;
  installments?: number;
  installment?: number;
  receivedValue?: number;
  paidAt?: Date;
  createdAt: Date;
  payerInfo?: string;
  financeInfo?: creditCardInfoDto | PixInfoDto | PaymentLinkInfoDto;
  user: {
    id: number;
    name: string;
  };
};

export type ListFinanceFilterDto = {
  startDate: Date;
  endDate: Date;
  installments?: number | FindOperator<any>;
  typeId?: number;
  statusId?: number;
  paymentMethodId?: PaymetMethodIdsDto;
  userId?: number;
  description?: string;
};

export type AdditionalFinanceOptionsDto = {
  taxes?: number;
  installments?: number;
  montlhyFee?: number;
  recurrenceDays?: number;
};

export type RequestCreateFinanceDto = {
  additionalOptions?: AdditionalFinanceOptionsDto;
} & FinanceInfosDto &
  FinanceDto;

export type MetaFinanceParams = {
  userId: number;
};

export type RequestCreateFinanceParamsDto = {
  data: RequestCreateFinanceDto;
};

export type FinanceInstallmentsDto = {
  installment: number;
  financeId: number;
} & FinanceDto;

export type FinanceHandlerDto = {
  finance: FinanceDto;
  userBalance: UserBalanceDto;
  additionalOptions?: AdditionalFinanceOptionsDto;
  financeInstallments?: FinanceInstallmentsDto[];
  newFinance?: Finance;
} & FinanceInfosDto;

export type FinancePayParamsDto = {
  id: number;
  installmentId?: number;
};

export type FinancePayBodyDto = {
  receivedValue: number;
  installment?: number;
  payerInfo?: string;
};

export type FinancePayRequestDto = {
  data: FinancePayBodyDto;
  filter: FinancePayParamsDto;
};

export type PayFinanceHandlerDto = {
  currentFinance: Finance | FinanceInstallment | null;
} & FinancePayOptionsDto;

export type FindFinanceParams = { id: number; installment?: number };

export type BalancePropsParamsDto = {
  liquidPrice?: number;
  typeId?: number;
  receivedValue?: number;
};

export type PayFinanceDataDto = {
  payerInfo?: string;
  paidAt?: Date;
  statusId: number;
  receivedValue: number;
};

export type FinancePayFilterDto = {
  financeId?: number;
  installment?: number;
  installmentId?: number;
  userId?: number;
};

export type FinancePayOptionsDto = {
  filter: FinancePayFilterDto;
  userBalance: UserBalanceDto;
  finance: PayFinanceDataDto;
  financeInstallment?: PayFinanceDataDto;
};

export type UpdateFinanceBodyDto = {
  liquidPrice?: number;
  payerInfo?: string;
  statusId?: number;
  receivedValue?: number;
  description?: string;
  isDeleted?: boolean;
};

export type FinanceWorkerDto = {
  data: Array<{
    id: number;
    statusId: number;
    installment?: number;
    installmentId?: number;
    isDeleted?: boolean;
  }>;
};

export type FinanceWorkerResponseDto = {
  id: number;
  statusId: string;
  isDeleted: boolean;
  installment?: number;
  installmentId?: number;
};
