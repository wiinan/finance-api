import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { IUserService } from './interfaces/user.interface';
import { CronJobUser } from 'src/crons/user.cron';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [{ provide: IUserService, useClass: UserService }, CronJobUser],
  exports: [],
})
export class UserModule {}
