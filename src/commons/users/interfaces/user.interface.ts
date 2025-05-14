import {
  LoginDto,
  LoginDtoData,
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
  abstract update(filter: UserParamsDto, data: UserFilterDto): Promise<boolean>;
  abstract delete(filter: UserParamsDto): Promise<boolean>;
  abstract isAdmin(id: number): Promise<number>;
}
