import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';

@Injectable()
export class DiscordLoginHelperStrategy extends PassportStrategy(
  Strategy,
  'discord',
) {
  constructor() {
    super((req: Request, done: (error: Error, user?: unknown) => void) => {
      done(
        req.query.error != null ? new Error(req.query.error as string) : null,
        usersSamples[0].user,
      );
    });
  }
}
