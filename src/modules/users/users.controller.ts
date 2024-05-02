import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { UseAuthGuard } from '@app/guards/auth.guard';

import { GetUsersQueryDto } from './dtos/get-users.dto';
import { UpdateUserSuperAdminStateDto } from './dtos/update-user-super-admin-state.dto';
import { UserDiscordIdParamDto } from './dtos/user-discord-id-param.dto';
import { UserDiscordUsernameParamDto } from './dtos/user-discord-username-param.dto';
import { UserIdParamDto } from './dtos/user-id-param.dto';
import { User } from './schemas/user';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseAuthGuard()
  @Get()
  @ApiOperation({ summary: 'Retrieves a list of users.' })
  @ApiOkResponse({ description: 'Users successfully retrieved', type: [User] })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  public async getMany(@Query() dto: GetUsersQueryDto): Promise<{
    totalCount: number;
    users: User[];
  }> {
    return this.usersService.getMany(dto);
  }

  @UseAuthGuard()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieves a user by their ID.' })
  @ApiOkResponse({ description: 'User successfully retrieved', type: User })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getById(@Param() { id }: UserIdParamDto): Promise<User> {
    return this.usersService.getById(id);
  }

  @UseAuthGuard()
  @Get('discord/ids/:discordId')
  @ApiOperation({ summary: 'Retrieves a user by their Discord ID.' })
  @ApiOkResponse({ description: 'User successfully retrieved', type: User })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getByDiscordId(
    @Param() { discordId }: UserDiscordIdParamDto,
  ): Promise<User> {
    return this.usersService.getByDiscordId(discordId);
  }

  @UseAuthGuard()
  @Get('discord/usernames/:discordUsername')
  @ApiOperation({ summary: 'Retrieves a user by their Discord username.' })
  @ApiOkResponse({ description: 'User successfully retrieved', type: User })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getByDiscordUsername(
    @Param() { discordUsername }: UserDiscordUsernameParamDto,
  ): Promise<User> {
    return this.usersService.getByDiscordUsername(discordUsername);
  }

  @UseAuthGuard({
    isSuperAdmin: true,
  })
  @Patch(':id/super-admin-state')
  @ApiOperation({ summary: 'Updates the super admin state of a user.' })
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'User super admin state successfully updated' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async updateSuperAdminState(
    @Param() { id }: UserIdParamDto,
    @Body() dto: UpdateUserSuperAdminStateDto,
  ): Promise<User> {
    return this.usersService.updateSuperAdminState(id, dto);
  }

  @UseAuthGuard()
  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a user by their ID.' })
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'User successfully deleted' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async delete(
    @Param() { id }: UserIdParamDto,
    @Req() { user }: Request,
  ): Promise<void> {
    return this.usersService.delete(id, user as User);
  }
}
