import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

import { UsersDao } from '@app/modules/users/users.dao';

@Injectable()
export class BearerLoginHelperStrategy extends PassportStrategy(
  Strategy,
  'bearer',
) {
  constructor(usersDao: UsersDao) {
    super((_req: Request, done: (error: Error, user?: unknown) => void) => {
      usersDao.getById('').then((user) => {
        done(null, user);
      });
    });
  }
}
