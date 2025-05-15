import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import {
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
import { AuthUtils } from 'src/helpers/auth';
import { JwtService } from '@nestjs/jwt';
import { pick } from 'lodash';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private jwtService: JwtService,
  ) {}

  public async create(data: UserDto): Promise<userDataDto> {
    const user = await this.userModel.count({
      where: { email: data.email },
    });

    if (user) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const newUser = this.userModel.create(data);
    await this.userModel.save(newUser);

    return newUser;
  }

  public async findAll(filter?: UserFilterDto): Promise<userDataDto[]> {
    const { query, parameters } = UserHelper.getWhereParams(filter);

    const users: userDataDto[] = await this.userModel
      .createQueryBuilder()
      .select('*')
      .where(query, parameters)
      .getRawMany();

    return users;
  }

  public async login(data: LoginDto): Promise<LoginDtoData> {
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

    const token = await this.jwtService.signAsync(
      pick(user, ['id', 'name', 'email', 'isRoot']),
    );

    return { user, token };
  }

  public async getProfile(filter: UserFilterDto): Promise<userDataDto> {
    const user = await this.userModel.findOne({
      where: { id: filter.id, isDeleted: false },
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
      .set(pick(data, ['name', 'isRoot', 'password', 'isDeleted']))
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
}
