import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLog, User } from 'src/database/entities';
import { MoreThan, Repository } from 'typeorm';
import { IAuthService } from './auth.interface';
import { MailerSendService } from 'src/gateways/service/mailersend';
import { AuthUtils } from 'src/helpers/auth';
import { UserHelper } from '../users/helpers/user.helpers';
import { JwtService } from '@nestjs/jwt';
import { pick } from 'lodash';
import {
  AuthenticateDto,
  LoginDto,
  LoginDtoData,
  ValidOtpCodeDto,
} from './auth.dto';
import { Utils } from 'src/helpers/utils';
import { userDataDto, UserDto } from '../users/dtos/user.dto';
import { OPT_ACTIONS } from 'src/constants/auth.constants';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(AuthLog)
    private readonly authLogModel: Repository<AuthLog>,
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
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

  private async updateOptCode(data: ValidOtpCodeDto): Promise<void> {
    const { user, token, action } = data;

    const otpCode = await this.authLogModel.count({
      where: {
        action,
        expiresAt: MoreThan(Utils.getDateWithoutTimezones()),
        isUsed: false,
        userId: user.id,
        token,
      },
    });

    if (!otpCode) {
      throw new HttpException('INVALID_TOKEN', HttpStatus.BAD_REQUEST);
    }

    await this.authLogModel.update({ userId: user.id }, { isUsed: true });
  }

  async generateBearerToken(user: User): Promise<LoginDtoData> {
    const token = await this.jwtService.signAsync({
      ...pick(user, ['name', 'email', 'isRoot']),
      userId: user.id,
    });

    return { user, token };
  }

  public async create(data: UserDto): Promise<userDataDto> {
    const user = await this.userModel.count({
      where: { email: data.email },
    });

    if (user) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const newUser = this.userModel.create(data);

    await Promise.all([
      this.sendOtpCode(newUser, OPT_ACTIONS.SIGN_IN),
      this.userModel.save(newUser),
    ]);

    return newUser;
  }

  public async login(data: LoginDto): Promise<boolean> {
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

    await this.sendOtpCode(user, OPT_ACTIONS.SIGN_IN);
    return true;
  }

  async authenticate(data: AuthenticateDto): Promise<LoginDtoData> {
    const { email, token } = data;

    const user = await this.userModel.findOne({
      where: { email, isDeleted: false },
    });

    if (!user) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    await this.updateOptCode({
      user,
      token,
      action: OPT_ACTIONS.SIGN_IN,
    });

    return this.generateBearerToken(user);
  }
}
