import { v4 as uuidv4 } from 'uuid';

import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { User } from '@app/modules/users/schemas/user';

import { DiscordLoginDto } from '../../dtos/discord-login.dto';

function createSampleDiscordLoginDto(index: number): DiscordLoginDto {
  return {
    successRedirectUrl: `https://sample-success-redirect-url-${index}.com`,
    failRedirectUrl: `https://sample-fail-redirect-url-${index}.com`,
  };
}

function createSampleDiscordStateDto(dto: DiscordLoginDto): {
  state: string;
} {
  return {
    state: encodeURIComponent(JSON.stringify(dto)),
  };
}

function createSampleDiscordResponse(index: number): {
  /* eslint-disable @typescript-eslint/naming-convention */
  id: string;
  username: string;
  discriminator: string;
  global_name: string;
  avatar: string;
} {
  return {
    id: uuidv4().replaceAll('-', ''),
    username: `sampleDiscordUsername${index}`,
    discriminator: index.toString(),
    global_name: `sampleDiscordGlobalName${index}`,
    avatar: `sampleDiscordAvatarHash${index}`,
  };
  /* eslint-enable @typescript-eslint/naming-convention */
}

function createSampleDiscordAxiosResponse(index: number): {
  data: string;
} {
  return {
    data: `sampleDiscordAxiosResponseData${index}`,
  };
}

function createSampleUserWithDiscordAvatar(index: number): User {
  return {
    ...usersSamples[index].user,
    discord: {
      ...usersSamples[index].user.discord,
      avatarHash: `sampleDiscordAvatarHash${index}`,
      avatarFilename: `sampleDiscordAvatarFilename${index}`,
    },
  };
}

function createSamples(index: number): {
  discordLoginDto: DiscordLoginDto;
  discordStateDto: {
    state: string;
  };
  discordResponse: {
    /* eslint-disable @typescript-eslint/naming-convention */
    id: string;
    username: string;
    discriminator: string;
    global_name: string;
    avatar: string;
    /* eslint-enable @typescript-eslint/naming-convention */
  };
  discordAxiosResponseData: {
    data: string;
  };
  userWithDiscordAvatar: User;
} {
  const discordLoginDto = createSampleDiscordLoginDto(index);
  const discordStateDto = createSampleDiscordStateDto(discordLoginDto);
  const discordResponse = createSampleDiscordResponse(index);
  const discordAxiosResponseData = createSampleDiscordAxiosResponse(index);
  const userWithDiscordAvatar = createSampleUserWithDiscordAvatar(index);

  return {
    discordLoginDto,
    discordStateDto,
    discordResponse,
    discordAxiosResponseData,
    userWithDiscordAvatar,
  };
}

export const authSamples = [
  createSamples(0),
  createSamples(1),
  createSamples(2),
];
