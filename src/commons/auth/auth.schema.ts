import {
  ZOD_BOOLEAN_DEFAULT_FALSE,
  ZOD_STRING_REQUIRED,
} from 'src/helpers/zod.helpers';
import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    name: ZOD_STRING_REQUIRED,
    email: z.string().email('Preencha com um email valido.'),
    isRoot: ZOD_BOOLEAN_DEFAULT_FALSE,
    password: ZOD_STRING_REQUIRED,
    confirmPassword: ZOD_STRING_REQUIRED,
  })
  .strip()
  .refine(({ password, confirmPassword }) => password === confirmPassword);

export const LoginUserSchema = z
  .object({
    email: z.string().email('Preencha com um email valido.'),
    password: ZOD_STRING_REQUIRED,
  })
  .strip();

export const AuthenticateUserSchema = z
  .object({
    email: z.string().email('Preencha com um email valido.'),
    password: ZOD_STRING_REQUIRED,
    token: ZOD_STRING_REQUIRED,
  })
  .strip();
