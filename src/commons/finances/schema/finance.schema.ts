import {
  ZOD_DATE_REQUIRED,
  ZOD_NUMBER_NULLABLE,
  ZOD_NUMBER_PARAMS,
  ZOD_NUMBER_REQUIRED,
  ZOD_STRING_NULLABLE,
  ZOD_STRING_PARSE_TO_NUMBER,
  ZOD_STRING_REQUIRED,
} from 'src/helpers/zod.helpers';
import { z } from 'zod';
import { Utils } from 'src/helpers/utils';

export const ListFinanceSchema = z
  .object({
    startDate: ZOD_DATE_REQUIRED,
    endDate: ZOD_DATE_REQUIRED,
    typeId: ZOD_STRING_PARSE_TO_NUMBER,
    statusId: ZOD_STRING_PARSE_TO_NUMBER,
    paymentMethodId: ZOD_STRING_PARSE_TO_NUMBER,
    userId: ZOD_STRING_PARSE_TO_NUMBER,
    description: ZOD_STRING_NULLABLE,
  })
  .strip()
  .refine(({ startDate, endDate }) =>
    Utils.validateDateSchema({ startDate, endDate }),
  );

export const FilterFinanceSchema = z.object({
  id: ZOD_NUMBER_PARAMS,
});

export const DeleteFinanceSchema = z.object({
  installment: ZOD_STRING_PARSE_TO_NUMBER,
});

export const PayFinanceBodySchema = z
  .object({
    receivedValue: ZOD_NUMBER_REQUIRED,
    payerInfo: ZOD_STRING_NULLABLE,
    installment: ZOD_NUMBER_NULLABLE,
  })
  .strip();

export const CreateFinanceSchema = z
  .object({
    price: ZOD_NUMBER_REQUIRED,
    description: ZOD_STRING_NULLABLE,
    competence: ZOD_STRING_REQUIRED,
    typeId: ZOD_NUMBER_REQUIRED,
    paymentMethodId: ZOD_NUMBER_REQUIRED,
    userId: ZOD_NUMBER_REQUIRED,
    liquidPrice: ZOD_NUMBER_NULLABLE,
    installments: ZOD_NUMBER_NULLABLE,
    additionalOptions: z
      .object({
        taxes: ZOD_NUMBER_NULLABLE,
        installments: ZOD_NUMBER_NULLABLE,
        montlhyFee: ZOD_NUMBER_NULLABLE,
        recurrenceDays: ZOD_NUMBER_NULLABLE,
      })
      .optional(),
    paymentLinkInfo: z
      .object({
        taxes: ZOD_NUMBER_NULLABLE,
        link: ZOD_STRING_NULLABLE,
      })
      .optional(),
    pixInfo: z
      .object({
        type: ZOD_STRING_NULLABLE,
        key: ZOD_STRING_NULLABLE,
        qrCode: ZOD_STRING_NULLABLE,
        taxes: ZOD_NUMBER_NULLABLE,
      })
      .optional(),
    creditCardInfo: z
      .object({
        cvv: ZOD_STRING_NULLABLE,
        number: ZOD_STRING_NULLABLE,
        titleName: ZOD_STRING_NULLABLE,
        dueDate: ZOD_STRING_NULLABLE,
        name: ZOD_STRING_NULLABLE,
        taxes: ZOD_NUMBER_NULLABLE,
      })
      .optional(),
  })
  .strip();
