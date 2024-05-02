import { Controller, Post, UseGuards } from '@nestjs/common';

import { User } from '@app/modules/users/schemas/user';

import { LoginHelperGuard } from './login-helper.guard';

@Controller('login-helper')
export class LoginHelperController {
  @UseGuards(LoginHelperGuard)
  @Post()
  public login(_dto: User): void {
    // Do nothing
  }
}
