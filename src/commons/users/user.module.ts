import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { IUserService } from './interfaces/user.interface';
import { CronJobUser } from 'src/crons/user.cron';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [{ provide: IUserService, useClass: UserService }, CronJobUser],
  exports: [],
})
export class UserModule {}
