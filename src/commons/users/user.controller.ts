import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  AuthenticateDto,
  LoginDto,
  LoginDtoData,
  userDataDto,
  UserDto,
  UserFilterDto,
  UserParamsDto,
} from './dtos/user.dto';
import { ZodValidationPipe } from 'src/middleware/validator.pipe';
import {
  AuthenticateUserSchema,
  CreateUserSchema,
  FilterUserSchema,
  FindAllUserSchema,
  LoginUserSchema,
} from './schema/user.schema';
import { IUserService } from './interfaces/user.interface';
import { AuthGuard } from 'src/middleware/auth';
import { RootAuthGuard } from 'src/middleware/root.auth';
import { Throttle } from '@nestjs/throttler';
import { throttlerConfig } from 'src/commons/throttler/throttler.module';

@Controller('user')
export class UserController {
  constructor(private readonly userService: IUserService) {}

  @Throttle({ default: throttlerConfig('MEDIUM') })
  @Post()
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  createUser(@Body() data: UserDto): Promise<userDataDto> {
    return this.userService.create(data);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(FindAllUserSchema))
  findAll(@Query() filter: UserFilterDto): Promise<userDataDto[]> {
    return this.userService.findAll(filter);
  }

  @Throttle({ default: throttlerConfig('MEDIUM') })
  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  login(@Body() data: LoginDto) {
    return this.userService.login(data);
  }

  @Throttle({ default: throttlerConfig('LONG') })
  @Post('authenticate')
  @UsePipes(new ZodValidationPipe(AuthenticateUserSchema))
  authenticate(@Body() data: AuthenticateDto): Promise<LoginDtoData> {
    return this.userService.authenticate(data);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  profile(@Request() request: Request): Promise<userDataDto> {
    return this.userService.getProfile(request['auth']);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  update(
    @Param(new ZodValidationPipe(FilterUserSchema)) filter: UserParamsDto,
    @Body(new ZodValidationPipe(FindAllUserSchema)) data: UserFilterDto,
  ) {
    return this.userService.update(filter, data);
  }

  @Delete('/:id')
  @UseGuards(RootAuthGuard)
  @UsePipes(new ZodValidationPipe(FilterUserSchema))
  delete(@Param() filter: UserParamsDto): Promise<boolean> {
    return this.userService.delete(filter);
  }
}
