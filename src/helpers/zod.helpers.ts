import { z } from 'zod';

export const ZOD_STRING_NULLABLE = z.string().optional();
export const ZOD_STRING_REQUIRED = z.string();
export const ZOD_NUMBER_NULLABLE = z.number().positive().optional();
export const ZOD_NUMBER_REQUIRED = z.number().positive();
export const ZOD_BOOLEAN_DEFAULT_FALSE = z.boolean().default(false);
