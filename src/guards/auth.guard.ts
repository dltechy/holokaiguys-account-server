import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User } from '@app/modules/users/schemas/user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSuperAdmin = this.reflector.get<boolean>(
      'isSuperAdmin',
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();

    if (!req.isAuthenticated()) {
      throw new UnauthorizedException();
    }

    if (
      isSuperAdmin != null &&
      (req.user as User).isSuperAdmin !== isSuperAdmin
    ) {
      throw new ForbiddenException();
    }

    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseAuthGuard({
  isSuperAdmin,
}: {
  isSuperAdmin?: boolean;
} = {}): Function {
  return applyDecorators(
    SetMetadata('isSuperAdmin', isSuperAdmin),
    UseGuards(AuthGuard),
  );
}
