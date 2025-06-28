import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleAuth } from './google.dto';
import { IGoogleService } from './google.interface';
import { IUserService } from '../users/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { Repository } from 'typeorm';
import { IAuthService } from '../auth/auth.interface';
import { LoginDtoData } from '../auth/auth.dto';

@Injectable()
export class GoogleService implements IGoogleService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly userService: IUserService,
    private readonly authService: IAuthService,
  ) {}

  private async createUser(data: GoogleAuth): Promise<LoginDtoData> {
    const newUser = this.userModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      provider: 'GOOGLE',
    });

    await this.userModel.save(newUser);

    return this.authService.generateBearerToken(newUser);
  }

  private async login(user: User): Promise<LoginDtoData> {
    await this.userService.update(
      { id: user.id },
      {
        provider: 'GOOGLE',
      },
    );

    return this.authService.generateBearerToken(user);
  }

  async googleLogin(data: GoogleAuth): Promise<LoginDtoData> {
    if (!data) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findOne({
      where: { email: data.email, isDeleted: false },
      select: ['id', 'email', 'provider', 'password'],
    });

    const hasGoogleAccount = user?.provider === 'GOOGLE';

    if (hasGoogleAccount) {
      return this.authService.generateBearerToken(user);
    }

    if (user) {
      return this.login(user);
    }

    return this.createUser(data);
  }
}
