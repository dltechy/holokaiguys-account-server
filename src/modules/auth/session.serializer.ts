import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '../users/schemas/user';
import { UsersDao } from '../users/users.dao';
import { PassportSessionUser } from './schemas/passport-session';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersDao: UsersDao) {
    super();
  }

  public async serializeUser(
    sessionUser: PassportSessionUser,
    done: (error: Error, sessionUser: PassportSessionUser) => void,
  ): Promise<void> {
    const currentDate = new Date();
    sessionUser.tokens = sessionUser.tokens.filter(
      (token) => currentDate < new Date(token.expiresAt),
    );

    done(null, sessionUser);
  }

  public async deserializeUser(
    sessionUser: PassportSessionUser,
    done: (error: Error, user: User) => void,
  ): Promise<void> {
    const currentDate = new Date();
    sessionUser.tokens = sessionUser.tokens.filter(
      (token) => currentDate < new Date(token.expiresAt),
    );

    const user = await this.usersDao.getById(sessionUser.id);
    done(null, user);
  }
}
