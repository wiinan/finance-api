import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { GoogleStrategy } from 'src/gateways/strategies/google.strategy';
import { IGoogleService } from './google.interface';
import { IUserService } from '../users/interfaces/user.interface';
import { UserService } from '../users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [GoogleController],
  providers: [
    GoogleStrategy,
    { provide: IUserService, useClass: UserService },
    { provide: IGoogleService, useClass: GoogleService },
  ],
  exports: [],
})
export class GoogleModule {}
