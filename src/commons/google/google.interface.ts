import { LoginDtoData } from '../auth/auth.dto';
import { GoogleAuth } from './google.dto';

export abstract class IGoogleService {
  abstract googleLogin(data: GoogleAuth): Promise<LoginDtoData>;
}
