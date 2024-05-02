import { Module } from '@nestjs/common';

import { SessionSerializer } from '@app/modules/auth/session.serializer';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { UsersDao } from '@app/modules/users/users.dao';

import { LoginHelperController } from './login-helper.controller';
import { LoginHelperService } from './login-helper.service';
import { LoginHelperStrategy } from './login-helper.strategy';

@Module({
  controllers: [LoginHelperController],
  providers: [
    LoginHelperService,
    LoginHelperStrategy,
    SessionSerializer,
    {
      provide: UsersDao,
      useValue: usersDaoMock,
    },
  ],
  exports: [LoginHelperService],
})
export class LoginHelperModule {}
