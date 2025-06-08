import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLog, User } from 'src/database/entities';
import { MoreThan, Repository } from 'typeorm';
import { IAuthService } from './auth.interface';
import { MailerSendService } from 'src/gateways/service/mailersend';
import { AuthUtils } from 'src/helpers/auth';
import { UserHelper } from '../users/helpers/user.helpers';
import { JwtService } from '@nestjs/jwt';
import { pick } from 'lodash';
import { LoginDtoData } from '../users/dtos/user.dto';
import { ValidOtpCodeDto } from './auth.dto';
import { Utils } from 'src/helpers/utils';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(AuthLog)
    private readonly authLogModel: Repository<AuthLog>,
    private mailerService: MailerSendService,
    private jwtService: JwtService,
  ) {}

  async sendOtpCode(user: User, action: string = 'SIGN_IN'): Promise<void> {
    const token = AuthUtils.getAuthCode();
    const htmlData = UserHelper.mountHtmlAuthCode(token);

    const log = this.authLogModel.create({
      userId: user.id,
      action,
      token,
    });

    await Promise.all([
      this.authLogModel.save(log),
      this.mailerService.sendEmail({
        email: user.email,
        subject: 'Código de acesso.',
        text: htmlData,
        html: htmlData,
      }),
    ]);
  }

  async hasValidOptCode(data: ValidOtpCodeDto): Promise<boolean> {
    const { user, token, action } = data;

    const otpCode = await this.authLogModel.count({
      where: {
        userId: user.id,
        action,
        token,
        expiresAt: MoreThan(Utils.getDateWithoutTimezones()),
      },
    });

    return !!otpCode;
  }

  async generateBearerToken(user: User): Promise<LoginDtoData> {
    const token = await this.jwtService.signAsync({
      ...pick(user, ['name', 'email', 'isRoot']),
      userId: user.id,
    });

    return { user, token };
  }
}
