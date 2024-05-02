import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { UseAuthGuard } from '@app/guards/auth.guard';
import { DiscordAuthGuard } from '@app/guards/discord-auth.guard';

import { User } from '../users/schemas/user';
import { AuthService } from './auth.service';
import { DiscordLoginDto } from './dtos/discord-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(DiscordAuthGuard)
  @Get('discord/login')
  @HttpCode(302)
  @ApiOperation({ summary: 'Logs a user into the system through Discord.' })
  public discordLogin(@Query() _dto: DiscordLoginDto): void {
    // Intentionally empty since it automatically
    // redirects to Discord's login page.
  }

  @UseGuards(DiscordAuthGuard)
  @Get('discord/callback')
  @ApiOperation({ summary: 'Callback after user logs in from Discord.' })
  @ApiOkResponse({ description: 'User successfully logged in', type: User })
  public discordCallback(@Req() req: Request, @Res() res: Response): void {
    const redirectUrl = this.authService.getRedirectUrl(req);
    res.redirect(redirectUrl);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logs a user out of the system.' })
  @ApiOkResponse({ description: 'User successfully logged out' })
  public async logout(@Req() req: Request): Promise<void> {
    return this.authService.logout(req);
  }

  @UseAuthGuard()
  @Get('userinfo')
  @ApiOperation({
    summary: 'Retrieves the information of the currently logged in user.',
  })
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'User info successfully retrieved',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  public userinfo(@Req() { user }: Request): User {
    return this.authService.userinfo(user as User);
  }
}
