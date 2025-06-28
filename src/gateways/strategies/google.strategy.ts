import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';
import { first } from 'lodash';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { displayName, emails, provider } = profile;

    if (!emails?.length) {
      return done(new Error('Email not found'));
    }

    const user = {
      email: first(emails)?.value,
      name: displayName,
      accessToken,
      refreshToken,
      provider,
    };

    done(null, user);
  }
}
