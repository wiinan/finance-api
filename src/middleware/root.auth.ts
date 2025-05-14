/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { userDataDto } from 'src/commons/users/dtos/user.dto';
import { IUserService } from 'src/commons/users/interfaces/user.interface';
import { AuthUtils } from 'src/helpers/auth';

@Injectable()
export class RootAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: IUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = AuthUtils.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: userDataDto = await this.jwtService.verifyAsync(token, {
        secret: process.env.APPLICATION_SECRET,
      });

      const isAdmin = await this.userService.isAdmin(payload.id);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request['auth'] = payload;

      return !!isAdmin;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
