import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthLog } from 'src/database/entities';
import { MailerSendService } from 'src/gateways/service/mailersend';
import { HttpModule } from '@nestjs/axios';
import { IAuthService } from './auth.interface';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuthLog]), HttpModule],
  providers: [
    MailerSendService,
    { provide: IAuthService, useClass: AuthService },
  ],
  controllers: [],
  exports: [IAuthService],
})
export class AuthModule {}
