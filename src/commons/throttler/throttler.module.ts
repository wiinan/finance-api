import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { CalculateUtils } from 'src/helpers/calculate';

export const throttlerConfig = (
  option: 'GLOBAL' | 'MEDIUM' | 'LONG',
): ThrottlerOptions => {
  const DEFAULT_THROTTLER_LIMIT = process.env.THROTTLE_LIMIT
    ? ~~process.env.THROTTLE_LIMIT
    : 3;
  const DEFAULT_TTL_LIMIT = process.env.TTL_LIMIT
    ? ~~process.env.TTL_LIMIT
    : 5000;

  const rateOptions = {
    GLOBAL: {
      name: 'default',
      ttl: DEFAULT_TTL_LIMIT,
      limit: DEFAULT_THROTTLER_LIMIT,
    },
    MEDIUM: {
      ttl: CalculateUtils.multiplyValues([DEFAULT_TTL_LIMIT, 2]),
      limit: DEFAULT_THROTTLER_LIMIT,
    },
    LONG: {
      ttl: CalculateUtils.multiplyValues([DEFAULT_TTL_LIMIT, 3]),
      limit: DEFAULT_THROTTLER_LIMIT,
    },
  };

  return rateOptions[option];
};

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => [throttlerConfig('GLOBAL')],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class CustomThrottleModule {}
