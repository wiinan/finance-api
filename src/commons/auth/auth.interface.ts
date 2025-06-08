import { User } from 'src/database/entities';
import { LoginDtoData } from '../users/dtos/user.dto';
import { ValidOtpCodeDto } from './auth.dto';

export abstract class IAuthService {
  abstract sendOtpCode(user: User, action: string): Promise<void>;
  abstract generateBearerToken(user: User): Promise<LoginDtoData>;
  abstract hasValidOptCode(data: ValidOtpCodeDto): Promise<boolean>;
}
