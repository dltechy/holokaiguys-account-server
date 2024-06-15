import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { AuthConfig } from '@app/config/interfaces/auth.config';
import { BearerStrategy as Strategy } from '@app/helpers/imports/imports.helper';

import { User } from '../users/schemas/user';
import { UsersDao } from '../users/users.dao';
import { PassportSession } from './schemas/passport-session';

@Injectable()
export class BearerStrategy extends Strategy {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersDao: UsersDao,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  public async validate(req: Request, bearerToken: string): Promise<User> {
    const { user: sessionUser } =
      (req.session as PassportSession).passport ?? {};

    if (sessionUser == null) {
      return null;
    }

    const currentDate = new Date();
    const tokenIndex = sessionUser.tokens.findIndex(
      (token) =>
        currentDate < new Date(token.expiresAt) &&
        token.bearerToken === bearerToken,
    );
    if (tokenIndex === -1) {
      return null;
    }

    const { sessionCookieMaxAge } = this.configService.get<AuthConfig>('auth');

    sessionUser.tokens[tokenIndex].expiresAt = new Date(
      Date.now() + sessionCookieMaxAge,
    ).toISOString();

    const user = await this.usersDao.getById(sessionUser.id);

    return user;
  }
}
