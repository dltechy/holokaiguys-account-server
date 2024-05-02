import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '@app/modules/users/schemas/user';

@Injectable()
export class DiscordLoginHelperSerializer extends PassportSerializer {
  public async serializeUser(
    user: User,
    done: (error: Error, user: User) => void,
  ): Promise<void> {
    done(null, user);
  }

  public async deserializeUser(
    user: User,
    done: (error: Error, user: User) => void,
  ): Promise<void> {
    done(null, user);
  }
}
