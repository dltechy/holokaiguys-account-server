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
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { UseBearerAuthGuard } from '@app/guards/bearer-auth.guard';

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

  @UseBearerAuthGuard()
  @Get()
  @ApiOperation({ summary: 'Retrieves a list of users.' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Users successfully retrieved', type: [User] })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  public async getMany(@Query() dto: GetUsersQueryDto): Promise<{
    totalCount: number;
    users: User[];
  }> {
    return this.usersService.getMany(dto);
  }

  @UseBearerAuthGuard()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieves a user by their ID.' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User successfully retrieved', type: User })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getById(@Param() { id }: UserIdParamDto): Promise<User> {
    return this.usersService.getById(id);
  }

  @UseBearerAuthGuard()
  @Get('discord/ids/:discordId')
  @ApiOperation({ summary: 'Retrieves a user by their Discord ID.' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User successfully retrieved', type: User })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getByDiscordId(
    @Param() { discordId }: UserDiscordIdParamDto,
  ): Promise<User> {
    return this.usersService.getByDiscordId(discordId);
  }

  @UseBearerAuthGuard()
  @Get('discord/usernames/:discordUsername')
  @ApiOperation({ summary: 'Retrieves a user by their Discord username.' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User successfully retrieved', type: User })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getByDiscordUsername(
    @Param() { discordUsername }: UserDiscordUsernameParamDto,
  ): Promise<User> {
    return this.usersService.getByDiscordUsername(discordUsername);
  }

  @UseBearerAuthGuard({
    isSuperAdmin: true,
  })
  @Patch(':id/super-admin-state')
  @ApiOperation({ summary: 'Updates the super admin state of a user.' })
  @ApiBearerAuth()
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

  @UseBearerAuthGuard()
  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a user by their ID.' })
  @ApiBearerAuth()
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
