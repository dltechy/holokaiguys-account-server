import { INestApplication, Injectable } from '@nestjs/common';
import * as request from 'supertest';

import { UsersDao } from '@app/modules/users/users.dao';

@Injectable()
export class LoginHelperService {
  constructor(private readonly usersDao: UsersDao) {}

  public async login({
    appGetter,
  }: {
    appGetter: () => INestApplication;
  }): Promise<{
    loginHeader: { [key: string]: string };
  }> {
    const user = await this.usersDao.getById('');

    const { header: loginHeader } = await request(appGetter().getHttpServer())
      .post(`/login-helper`)
      .send(user);

    return {
      loginHeader,
    };
  }
}
