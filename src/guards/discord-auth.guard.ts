import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();

      await super.canActivate(context);

      await super.logIn(req);
    } catch (e) {
      // Ignore failing auth.
    }

    return true;
  }
}
