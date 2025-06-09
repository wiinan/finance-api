import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthenticateDto,
  CronUserBalanceDataDto,
  LoginDto,
  LoginDtoData,
  UpdateUserDto,
  userDataDto,
  UserDto,
  UserFilterDto,
  UserParamsDto,
} from './dtos/user.dto';
import { IUserService } from './interfaces/user.interface';
import { UserHelper } from './helpers/user.helpers';
import { pick } from 'lodash';
import { User } from 'src/database/entities';
import { IAuthService } from '../auth/auth.interface';
import { OPT_ACTIONS } from 'src/constants/auth.constants';
import { AuthUtils } from 'src/helpers/auth';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly authService?: IAuthService,
  ) {}

  public async create(data: UserDto): Promise<userDataDto> {
    const user = await this.userModel.count({
      where: { email: data.email },
    });

    if (user) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const newUser = this.userModel.create(data);

    await Promise.all([
      this.authService?.sendOtpCode(newUser, OPT_ACTIONS.SIGN_IN),
      this.userModel.save(newUser),
    ]);

    return newUser;
  }

  public async findAll(filter?: UserFilterDto): Promise<User[]> {
    const { query, parameters } = UserHelper.getWhereParams(filter);

    const users: User[] = await this.userModel
      .createQueryBuilder()
      .select('*')
      .where(query, parameters)
      .getRawMany();

    return users;
  }

  public async login(data: LoginDto): Promise<boolean> {
    const { email, password } = data;

    const user = await this.userModel.findOne({
      where: { email, isDeleted: false },
    });

    if (!user) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const isValidPassword = AuthUtils.compareSync(password, user.password);

    if (!isValidPassword) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    await this.authService?.sendOtpCode(user, OPT_ACTIONS.SIGN_IN);
    return true;
  }

  async authenticate(data: AuthenticateDto): Promise<LoginDtoData> {
    const { email, token } = data;

    const user = await this.userModel.findOne({
      where: { email, isDeleted: false },
    });

    if (!user || !this.authService) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const isValidAuth = await this.authService.hasValidOptCode({
      user,
      token,
      action: OPT_ACTIONS.SIGN_IN,
    });

    if (!isValidAuth) {
      throw new HttpException('INVALID_TOKEN', HttpStatus.BAD_REQUEST);
    }

    return this.authService.generateBearerToken(user);
  }

  public async getProfile(filter: UserFilterDto): Promise<userDataDto> {
    const user = await this.userModel.findOne({
      where: { id: filter.userId, isDeleted: false },
    });

    if (!user) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  public async update(
    filter: UserParamsDto,
    data: UpdateUserDto,
  ): Promise<boolean> {
    const { id } = filter;

    const currentUser = await this.userModel.findOne({
      where: { id },
    });

    if (!currentUser) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (id !== currentUser.id && !currentUser.isRoot) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    await this.userModel
      .createQueryBuilder()
      .update(User)
      .set(
        pick(data, [
          'name',
          'isRoot',
          'isDeleted',
          'incomeBalance',
          'expenseBalance',
          'receivedBalance',
          'provider',
        ]),
      )
      .where('id = :id', { id })
      .execute();

    return true;
  }

  public async delete(filter: UserParamsDto): Promise<boolean> {
    await this.userModel.update({ id: filter.id }, { isDeleted: true });

    return true;
  }

  public async isAdmin(id: number): Promise<number> {
    return this.userModel.count({
      where: {
        id,
        isDeleted: false,
        isRoot: true,
      },
    });
  }

  public async updateUserBalance(
    filter: UserParamsDto,
    data: UpdateUserDto,
  ): Promise<void> {
    const user = await this.findAll({ id: filter.id });
    const userData = (user && user[0]) || {};
    const balanceData = UserHelper.calculateBalances(userData, data);

    await this.update(filter, balanceData);
  }

  public async getUserIncomeAndExpenseBalances(): Promise<
    CronUserBalanceDataDto[]
  > {
    const query: string = `SELECT
        users.id as "userId",
        finances."typeId",
        SUM(finances."liquidPrice") as "liquidPrice",
        CASE
          WHEN finances."typeId" = 1
          AND SUM(finances."liquidPrice") != users."expenseBalance" THEN true
          WHEN finances."typeId" = 2
          AND SUM(finances."liquidPrice") != users."incomeBalance" THEN true
          ELSE false
        END as "hasUpdateBalance"
      FROM
        finances
        LEFT JOIN users ON users.id = finances."userId"
        AND users."isDeleted" = false
      WHERE
        finances."isDeleted" = false
      GROUP BY
        users.id,
        finances."typeId";`;

    return ((await this.userModel.query(query)) ||
      []) as CronUserBalanceDataDto[];
  }

  public async getUserReceivedValueBalance(): Promise<
    CronUserBalanceDataDto[]
  > {
    const query: string = `
      SELECT
        users.id as "userId",
        SUM(finances."receivedValue") as "receivedValue",
        CASE
          WHEN SUM(finances."receivedValue") != users."receivedBalance" THEN true
          ELSE false
        END as "hasUpdateBalance"
      FROM finances
        LEFT JOIN users ON users.id = finances."userId" AND users."isDeleted" = false
      WHERE
        finances."isDeleted" = false
        AND finances."typeId" = 2
      GROUP BY
        users.id
    `;

    return ((await this.userModel.query(query)) ||
      []) as CronUserBalanceDataDto[];
  }
}
