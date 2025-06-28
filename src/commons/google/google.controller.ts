import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from 'src/middleware';
import { RequestGoogle } from './google.dto';
import { IGoogleService } from './google.interface';
import { LoginDtoData } from '../auth/auth.dto';

@Controller('auth')
export class GoogleController {
  constructor(private readonly googleService: IGoogleService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req: RequestGoogle): Promise<LoginDtoData> {
    return this.googleService.googleLogin(req['user']);
  }
}
