import {
  ZOD_BOOLEAN_DEFAULT_FALSE,
  ZOD_NUMBER_NULLABLE,
  ZOD_NUMBER_PARAMS,
  ZOD_STRING_NULLABLE,
} from 'src/helpers/zod.helpers';
import { z } from 'zod';

export const FindAllUserSchema = z
  .object({
    id: ZOD_NUMBER_NULLABLE,
    name: ZOD_STRING_NULLABLE,
    email: ZOD_STRING_NULLABLE,
    isRoot: ZOD_BOOLEAN_DEFAULT_FALSE,
    isDeleted: ZOD_BOOLEAN_DEFAULT_FALSE,
  })
  .strip();

export const FilterUserSchema = z.object({ id: ZOD_NUMBER_PARAMS }).strip();
