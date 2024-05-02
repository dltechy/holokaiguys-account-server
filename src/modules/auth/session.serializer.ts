import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '@app/modules/users/schemas/user';

import { UsersDao } from '../users/users.dao';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersDao: UsersDao) {
    super();
  }

  public async serializeUser(
    { id }: User,
    done: (error: Error, user: User) => void,
  ): Promise<void> {
    const user = await this.usersDao.getById(id);
    done(null, user);
  }

  public async deserializeUser(
    { id }: User,
    done: (error: Error, user: User) => void,
  ): Promise<void> {
    const user = await this.usersDao.getById(id);
    done(null, user);
  }
}
