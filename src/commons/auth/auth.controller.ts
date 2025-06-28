import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { IAuthService } from './auth.interface';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'src/middleware';
import { userDataDto, UserDto } from '../users/dtos/user.dto';
import { throttlerConfig } from '../throttler/throttler.module';
import {
  AuthenticateUserSchema,
  CreateUserSchema,
  LoginUserSchema,
} from './auth.schema';
import { AuthenticateDto, LoginDto, LoginDtoData } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @Throttle({ default: throttlerConfig('MEDIUM') })
  @Post()
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  createUser(@Body() data: UserDto): Promise<userDataDto> {
    return this.authService.create(data);
  }

  @Throttle({ default: throttlerConfig('MEDIUM') })
  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Throttle({ default: throttlerConfig('LONG') })
  @Post('authenticate')
  @UsePipes(new ZodValidationPipe(AuthenticateUserSchema))
  authenticate(@Body() data: AuthenticateDto): Promise<LoginDtoData> {
    return this.authService.authenticate(data);
  }
}
