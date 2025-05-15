import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleAuth } from './google.dto';
import { LoginDtoData } from '../users/dtos/user.dto';
import { IGoogleService } from './google.interface';
import { IUserService } from '../users/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleService implements IGoogleService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly userService: IUserService,
  ) {}

  private async createUser(data: GoogleAuth): Promise<LoginDtoData> {
    const newUser = this.userModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      provider: 'GOOGLE',
    });

    await this.userModel.save(newUser);

    return this.userService.login({
      email: data.email,
      password: data.password,
    });
  }

  private async login(id: number, data: GoogleAuth): Promise<LoginDtoData> {
    await this.userService.update(
      { id },
      {
        provider: 'GOOGLE',
        password: data.password,
      },
    );

    return this.userService.login({
      email: data.email,
      password: data.password,
    });
  }

  async googleLogin(data: GoogleAuth): Promise<LoginDtoData> {
    if (!data) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findOne({
      where: { email: data.email, isDeleted: false },
      select: ['id', 'email', 'password', 'provider'],
    });

    const hasGoogleAccount = user?.provider === 'GOOGLE';

    if (hasGoogleAccount) {
      return this.userService.login({
        email: data.email,
        password: data.password,
      });
    }

    if (user) {
      return this.login(user.id, data);
    }

    return this.createUser(data);
  }
}
