import { User } from 'src/database/entities';

export type ValidOtpCodeDto = {
  user: User;
  action: string;
  token: string;
};
