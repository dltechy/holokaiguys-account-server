import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { AppConfig } from '@app/config/interfaces/app.config';
import { AuthConfig } from '@app/config/interfaces/auth.config';
import {
  UtilPromisifyType,
  utilSymbol,
  UtilType,
} from '@app/helpers/imports/imports.helper';
import { UuidHelper } from '@app/helpers/uuid/uuid.helper';
import { RedisService } from '@app/providers/redis/redis.service';

import { User } from '../users/schemas/user';
import { DiscordLoginDto } from './dtos/discord-login.dto';
import { PassportSession } from './schemas/passport-session';

@Injectable()
export class AuthService {
  private readonly promisify: UtilPromisifyType;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly uuidHelper: UuidHelper,
    @Inject(utilSymbol) util: UtilType,
  ) {
    this.promisify = util.promisify;
  }

  private validateRedirectUrls({
    successRedirectUrl,
    failRedirectUrl,
  }: DiscordLoginDto): boolean {
    const { corsOrigin } = this.configService.get<AppConfig>('app');

    if (corsOrigin == null) {
      return true;
    }

    const successRedirectUrlOrigin = new URL(successRedirectUrl).origin;
    const failRedirectUrlOrigin = new URL(failRedirectUrl).origin;

    return [successRedirectUrlOrigin, failRedirectUrlOrigin].every(
      (redirectUrlOrigin) => {
        return corsOrigin.some((origin) => {
          if (typeof origin === 'string') {
            return redirectUrlOrigin === origin;
          }

          return (origin as RegExp).test(redirectUrlOrigin);
        });
      },
    );
  }

  public async createDiscordLoginState(
    state?: string,
    dto?: DiscordLoginDto,
  ): Promise<string> {
    if (state != null) {
      return state;
    }

    if (!this.validateRedirectUrls(dto)) {
      throw new BadRequestException('Invalid redirect URLs.');
    }

    const newState = this.uuidHelper.generate();

    const { loginStateTtlSeconds } = this.configService.get<AuthConfig>('auth');

    await this.redisService.set(
      newState,
      JSON.stringify(dto),
      'EX',
      loginStateTtlSeconds,
    );

    return newState;
  }

  public async getRedirectUrl(
    state: string,
    user: User,
    session: PassportSession,
  ): Promise<string> {
    if (state == null) {
      throw new BadRequestException('State not found in request.');
    }

    const foundState = await this.redisService.get(state);
    if (foundState == null) {
      throw new BadRequestException('State not found.');
    }

    await this.redisService.del(state);

    const { successRedirectUrl, failRedirectUrl } = JSON.parse(foundState);
    if (successRedirectUrl == null || failRedirectUrl == null) {
      throw new BadRequestException('Invalid state.');
    }

    if (
      !this.validateRedirectUrls({
        successRedirectUrl,
        failRedirectUrl,
      })
    ) {
      throw new BadRequestException('Invalid redirect URLs.');
    }

    if (user != null) {
      const { user: sessionUser } = session.passport ?? {};

      if (sessionUser == null) {
        throw new UnauthorizedException();
      }

      const { sessionCookieMaxAge } =
        this.configService.get<AuthConfig>('auth');

      const newAuthorizationCode = this.uuidHelper.generate();
      sessionUser.tokens.push({
        authorizationCode: newAuthorizationCode,
        bearerToken: '',
        expiresAt: new Date(Date.now() + sessionCookieMaxAge).toISOString(),
      });

      const redirectUrl = new URL(successRedirectUrl);
      redirectUrl.searchParams.append('code', newAuthorizationCode);
      return redirectUrl.toString();
    }

    return failRedirectUrl;
  }

  public token(
    authorizationCode: string,
    session: PassportSession,
  ): {
    bearerToken: string;
  } {
    const { user: sessionUser } = session.passport ?? {};
    if (sessionUser == null) {
      throw new UnauthorizedException();
    }

    const currentDate = new Date();
    const tokenIndex = sessionUser.tokens.findIndex(
      (token) =>
        currentDate < new Date(token.expiresAt) &&
        token.authorizationCode === authorizationCode,
    );

    if (tokenIndex === -1) {
      throw new ForbiddenException('Invalid authorization code.');
    }

    const newBearerToken = this.uuidHelper.generate();
    sessionUser.tokens[tokenIndex].bearerToken = newBearerToken;

    return {
      bearerToken: newBearerToken,
    };
  }

  public async logout(req: Request): Promise<void> {
    const logoutAsync = this.promisify(req.logout.bind(req));
    const destroySessionAsync = this.promisify(
      req.session.destroy.bind(req.session),
    );

    await logoutAsync();
    await destroySessionAsync();
  }

  public userinfo(user: User): User {
    return user;
  }
}
