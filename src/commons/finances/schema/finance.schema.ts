import {
  ZOD_NUMBER_NULLABLE,
  ZOD_NUMBER_REQUIRED,
  ZOD_STRING_NULLABLE,
  ZOD_STRING_REQUIRED,
} from 'src/helpers/zod.helpers';
import { z } from 'zod';

export const CreateFinanceSchema = z
  .object({
    price: ZOD_NUMBER_REQUIRED,
    description: ZOD_STRING_NULLABLE,
    competence: ZOD_STRING_REQUIRED,
    typeId: ZOD_NUMBER_REQUIRED,
    statusId: ZOD_NUMBER_REQUIRED,
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
  })
  .strip();
