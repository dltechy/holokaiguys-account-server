import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

import { AuthConfig } from '@app/config/interfaces/auth.config';
import { RedisService } from '@app/providers/redis/redis.service';

export function initializeSession(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const redisClient = app.get(RedisService);

  const {
    cookieSecret,
    sessionSecret,
    sessionCookieMaxAge,
    isUsingProxy,
    isSessionCookieSecure,
  } = configService.get<AuthConfig>('auth');

  app.use(cookieParser(cookieSecret));

  app.use(
    session({
      proxy: isUsingProxy,
      secret: sessionSecret,
      store: new RedisStore({ client: redisClient }),
      resave: true,
      rolling: true,
      saveUninitialized: false,
      cookie: {
        maxAge: sessionCookieMaxAge,
        signed: true,
        httpOnly: true,
        secure: isSessionCookieSecure,
        sameSite: 'strict',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
