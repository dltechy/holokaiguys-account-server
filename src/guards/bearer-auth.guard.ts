import {
  applyDecorators,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { User } from '@app/modules/users/schemas/user';

@Injectable()
export class BearerAuthGuard extends AuthGuard('bearer') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const isSuperAdmin = this.reflector.get<boolean>(
      'isSuperAdmin',
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();

    if (
      isSuperAdmin != null &&
      (req.user as User).isSuperAdmin !== isSuperAdmin
    ) {
      return false;
    }

    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseBearerAuthGuard({
  isSuperAdmin,
}: {
  isSuperAdmin?: boolean;
} = {}): Function {
  return applyDecorators(
    SetMetadata('isSuperAdmin', isSuperAdmin),
    UseGuards(BearerAuthGuard),
  );
}
