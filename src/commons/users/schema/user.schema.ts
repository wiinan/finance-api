import {
  ZOD_BOOLEAN_DEFAULT_FALSE,
  ZOD_NUMBER_NULLABLE,
  ZOD_NUMBER_PARAMS,
  ZOD_STRING_NULLABLE,
  ZOD_STRING_REQUIRED,
} from 'src/helpers/zod.helpers';
import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    name: ZOD_STRING_REQUIRED,
    email: z.string().email('Preencha com um email valido.'),
  })
  .strip();

export const FindAllUserSchema = z
  .object({
    id: ZOD_NUMBER_NULLABLE,
    name: ZOD_STRING_NULLABLE,
    email: ZOD_STRING_NULLABLE,
    isRoot: ZOD_BOOLEAN_DEFAULT_FALSE,
    isDeleted: ZOD_BOOLEAN_DEFAULT_FALSE,
  })
  .strip();

export const LoginUserSchema = z
  .object({
    email: z.string().email('Preencha com um email valido.'),
  })
  .strip();

export const AuthenticateUserSchema = z
  .object({
    email: z.string().email('Preencha com um email valido.'),
    token: ZOD_STRING_REQUIRED,
  })
  .strip();

export const FilterUserSchema = z.object({ id: ZOD_NUMBER_PARAMS }).strip();
