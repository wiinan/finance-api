import {
  LoginDto,
  LoginDtoData,
  UpdateUserDto,
  userDataDto,
  UserDto,
  UserFilterDto,
  UserParamsDto,
} from '../dtos/user.dto';

export abstract class IUserService {
  abstract create(data: UserDto): Promise<userDataDto>;
  abstract findAll(filter?: UserFilterDto): Promise<userDataDto[]>;
  abstract login(data: LoginDto): Promise<LoginDtoData>;
  abstract getProfile(filter: UserFilterDto): Promise<userDataDto>;
  abstract update(filter: UserParamsDto, data: UpdateUserDto): Promise<boolean>;
  abstract delete(filter: UserParamsDto): Promise<boolean>;
  abstract isAdmin(id: number): Promise<number>;
  abstract updateUserBalance(
    filter: UserParamsDto,
    data: UpdateUserDto,
  ): Promise<void>;
}
