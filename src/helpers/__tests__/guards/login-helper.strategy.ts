import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

@Injectable()
export class LoginHelperStrategy extends PassportStrategy(
  Strategy,
  'login-helper',
) {
  constructor() {
    super((req: Request, done: (error: Error, user?: unknown) => void) => {
      done(null, req.body);
    });
  }
}
