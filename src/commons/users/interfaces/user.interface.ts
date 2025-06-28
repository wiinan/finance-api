import {
  CronUserBalanceDataDto,
  UpdateUserDto,
  userDataDto,
  UserFilterDto,
  UserParamsDto,
} from '../dtos/user.dto';

export abstract class IUserService {
  abstract findAll(filter?: UserFilterDto): Promise<userDataDto[]>;
  abstract getProfile(filter: UserFilterDto): Promise<userDataDto>;
  abstract update(filter: UserParamsDto, data: UpdateUserDto): Promise<boolean>;
  abstract delete(filter: UserParamsDto): Promise<boolean>;
  abstract isAdmin(id: number): Promise<number>;
  abstract updateUserBalance(
    filter: UserParamsDto,
    data: UpdateUserDto,
  ): Promise<void>;
  abstract getUserIncomeAndExpenseBalances(): Promise<CronUserBalanceDataDto[]>;
  abstract getUserReceivedValueBalance(): Promise<CronUserBalanceDataDto[]>;
}
