import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LoginHelperGuard extends AuthGuard('login-helper') {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    await super.canActivate(context);

    await super.logIn(req);

    return true;
  }
}
