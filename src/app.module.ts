import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from './database/config';
import { UserModule } from './commons/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { GoogleModule } from './commons/google/google.module';
import { FinanceModule } from './commons/finances/finance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomThrottleModule } from './commons/throttler/throttler.module';
import { MetaModule } from './commons/meta/meta.module';
import { CustomEventModule } from './commons/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.APPLICATION_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    ScheduleModule.forRoot(),
    CustomThrottleModule,
    CustomEventModule,
    TypeOrmModule,
    UserModule,
    GoogleModule,
    FinanceModule,
    MetaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
