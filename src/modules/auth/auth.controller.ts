import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { UseBearerAuthGuard } from '@app/guards/bearer-auth.guard';
import { DiscordAuthGuard } from '@app/guards/discord-auth.guard';

import { User } from '../users/schemas/user';
import { AuthService } from './auth.service';
import { DiscordLoginDto } from './dtos/discord-login.dto';
import { TokenDto } from './dtos/token.dto';
import { PassportSession } from './schemas/passport-session';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(DiscordAuthGuard)
  @Get('discord/login')
  @HttpCode(302)
  @ApiOperation({ summary: 'Logs a user into the system through Discord.' })
  public async discordLogin(
    @Query() _dto: DiscordLoginDto,
    @Session() session: PassportSession,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.discordCallback(session, req, res);
  }

  @UseGuards(DiscordAuthGuard)
  @Get('discord/callback')
  @HttpCode(302)
  @ApiOperation({ summary: 'Callback after user logs in from Discord.' })
  @ApiOkResponse({ description: 'User successfully logged in', type: User })
  public async discordCallback(
    @Session() session: PassportSession,
    @Req() { query, user }: Request,
    @Res() res: Response,
  ): Promise<void> {
    const redirectUrl = await this.authService.getRedirectUrl(
      query.state as string,
      user as User,
      session,
    );
    res.redirect(redirectUrl);
  }

  @Get('token')
  @ApiOperation({
    summary: 'Creates and returns a new bearer token for the user.',
  })
  @ApiOkResponse({ description: 'Bearer token successfully retrieved' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  public token(
    @Query() { code }: TokenDto,
    @Session() session: PassportSession,
  ): {
    bearerToken: string;
  } {
    return this.authService.token(code, session);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logs a user out of the system.' })
  @ApiOkResponse({ description: 'User successfully logged out' })
  public async logout(@Req() req: Request): Promise<void> {
    return this.authService.logout(req);
  }

  @UseBearerAuthGuard()
  @Get('userinfo')
  @ApiOperation({
    summary: 'Retrieves the information of the currently logged in user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'User info successfully retrieved',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  public userinfo(@Req() { user }: Request): User {
    return this.authService.userinfo(user as User);
  }
}
