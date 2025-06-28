import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { userDataDto, UserFilterDto, UserParamsDto } from './dtos/user.dto';
import { ZodValidationPipe } from 'src/middleware/validator.pipe';
import { FilterUserSchema, FindAllUserSchema } from './schema/user.schema';
import { IUserService } from './interfaces/user.interface';
import { AuthGuard } from 'src/middleware/auth';
import { RootAuthGuard } from 'src/middleware/root.auth';

@Controller('user')
export class UserController {
  constructor(private readonly userService: IUserService) {}
  @Get()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(FindAllUserSchema))
  findAll(@Query() filter: UserFilterDto): Promise<userDataDto[]> {
    return this.userService.findAll(filter);
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
