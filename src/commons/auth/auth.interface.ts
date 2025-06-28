import { User } from 'src/database/entities';
import { AuthenticateDto, LoginDto, LoginDtoData } from './auth.dto';
import { userDataDto, UserDto } from '../users/dtos/user.dto';

export abstract class IAuthService {
  abstract create(data: UserDto): Promise<userDataDto>;
  abstract sendOtpCode(user: User, action: string): Promise<void>;
  abstract generateBearerToken(user: User): Promise<LoginDtoData>;
  abstract login(data: LoginDto): Promise<boolean>;
  abstract authenticate(data: AuthenticateDto): Promise<LoginDtoData>;
}
