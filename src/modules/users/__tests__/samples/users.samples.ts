import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto } from '@app/modules/users/dtos/create-user.dto';
import { User } from '@app/modules/users/schemas/user';

import { UpdateUserDiscordInfoDto } from '../../dtos/update-user-discord-info.dto';
import { UpdateUserSuperAdminStateDto } from '../../dtos/update-user-super-admin-state.dto';

function createSampleUser(index: number, isSuperAdmin: boolean): User {
  const now = new Date(Date.now() + index);

  return {
    id: uuidv4(),
    isSuperAdmin,
    discord: {
      id: uuidv4(),
      username: `sampleDiscordUsername${index}`,
      displayName: `sampleDiscordDisplayName${index}`,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function createSampleUserResponse(user: User): Omit<
  User,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
} {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function createSampleCreateDto(user: User): CreateUserDto {
  return {
    isSuperAdmin: user.isSuperAdmin,
    discord: {
      id: user.discord.id,
      username: user.discord.username,
      displayName: user.discord.displayName,
    },
  };
}

function createSampleUpdateSuperAdminStateDto(
  user: User,
): UpdateUserSuperAdminStateDto {
  return {
    isSuperAdmin: !user.isSuperAdmin,
  };
}

function createSampleUpdateDiscordInfoDto(
  index: number,
): UpdateUserDiscordInfoDto {
  return {
    username: `sampleUpdatedDiscordUsername${index}`,
    displayName: `sampleUpdatedDiscordDisplayName${index}`,
    avatarHash: `sampleUpdatedDiscordAvatarHash${index}`,
    avatarFilename: `sampleUpdatedDiscordAvatarFilename${index}`,
  };
}

function createSampleCreateModel(user: User): CreateUserDto {
  return {
    isSuperAdmin: user.isSuperAdmin,
    discord: {
      id: user.discord.id,
      username: user.discord.username,
      displayName: user.discord.displayName,
    },
  };
}

function createSampleDaoOutput(user: User): User {
  return {
    ...user,
    id: expect.any(String),
    discord: {
      ...user.discord,
      id: expect.any(String),
      avatarHash: null,
      avatarFilename: null,
    },
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };
}

function createSamples(
  index: number,
  isSuperAdmin: boolean,
): {
  user: User;
  userResponse: Omit<User, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  };
  createDto: CreateUserDto;
  updateSuperAdminStateDto: UpdateUserSuperAdminStateDto;
  updateDiscordInfoDto: UpdateUserDiscordInfoDto;
  createModel: CreateUserDto;
  daoOutput: User;
} {
  const user = createSampleUser(index, isSuperAdmin);
  const userResponse = createSampleUserResponse(user);
  const createDto = createSampleCreateDto(user);
  const updateSuperAdminStateDto = createSampleUpdateSuperAdminStateDto(user);
  const updateDiscordInfoDto = createSampleUpdateDiscordInfoDto(index);
  const createModel = createSampleCreateModel(user);
  const daoOutput = createSampleDaoOutput(user);

  return {
    user,
    userResponse,
    createDto,
    updateSuperAdminStateDto,
    updateDiscordInfoDto,
    createModel,
    daoOutput,
  };
}

export const usersSamples = [
  createSamples(0, true),
  createSamples(1, false),
  createSamples(2, false),
];
