import { LoginDtoData } from '../users/dtos/user.dto';
import { GoogleAuth } from './google.dto';

export abstract class IGoogleService {
  abstract googleLogin(data: GoogleAuth): Promise<LoginDtoData>;
}
