import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthLog, User } from 'src/database/entities';
import { MailerSendService } from 'src/gateways/service/mailersend';
import { HttpModule } from '@nestjs/axios';
import { IAuthService } from './auth.interface';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuthLog, User]), HttpModule],
  providers: [
    MailerSendService,
    { provide: IAuthService, useClass: AuthService },
  ],
  controllers: [AuthController],
  exports: [IAuthService],
})
export class AuthModule {}
