import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { AppConfig } from '@app/config/interfaces/app.config';
import {
  UtilPromisifyType,
  utilSymbol,
  UtilType,
} from '@app/helpers/imports/imports.helper';

import { User } from '../users/schemas/user';
import { DiscordLoginDto } from './dtos/discord-login.dto';

@Injectable()
export class AuthService {
  private readonly promisify: UtilPromisifyType;

  constructor(
    private readonly configService: ConfigService,
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

  public getDiscordLoginState(req: Request): string {
    if (req.query.state != null) {
      return '';
    }

    if (!this.validateRedirectUrls(req.query as {} as DiscordLoginDto)) {
      throw new BadRequestException('Invalid redirect URLs.');
    }

    return encodeURIComponent(JSON.stringify(req.query));
  }

  public getRedirectUrl(req: Request): string {
    if (req.query.state == null) {
      throw new BadRequestException('Redirect URLs not found in request.');
    }

    const state = JSON.parse(
      decodeURIComponent(req.query.state as string),
    ) as DiscordLoginDto;

    if (!this.validateRedirectUrls(state)) {
      throw new BadRequestException('Invalid redirect URLs.');
    }

    if (req.user != null) {
      return state.successRedirectUrl;
    }
    return state.failRedirectUrl;
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
