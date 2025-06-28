import { User } from 'src/database/entities';
import { userDataDto } from '../users/dtos/user.dto';

export type ValidOtpCodeDto = {
  user: User;
  action: string;
  token: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthenticateDto = {
  email: string;
  password: string;
  token: string;
};

export type LoginDtoData = {
  token: string;
  user: userDataDto;
};
