import * as uuid from 'uuid';

import { UuidHelper } from '@app/helpers/uuid/uuid.helper';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { User } from '@app/modules/users/schemas/user';

import { DiscordLoginDto } from '../../dtos/discord-login.dto';
import { PassportSessionUser } from '../../schemas/passport-session';

const uuidHelper = new UuidHelper(uuid);

function createSampleDiscordLoginDto(index: number): DiscordLoginDto {
  return {
    successRedirectUrl: `https://sample-success-redirect-url-${index}.com`,
    failRedirectUrl: `https://sample-fail-redirect-url-${index}.com`,
  };
}

function createSampleDiscordStateDto(): {
  state: string;
} {
  return {
    state: uuidHelper.generate(),
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
    id: uuidHelper.generate(),
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

function createSamplePassportSessionUser(
  user: User,
  index: number,
): PassportSessionUser {
  const now = new Date();

  return {
    id: user.id,
    tokens: [
      {
        authorizationCode: `sampleAuthorizationCode${index}`,
        bearerToken: `sampleBearerToken${index}`,
        expiresAt: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        ).toISOString(),
      },
    ],
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
  passportSessionUser: PassportSessionUser;
} {
  const discordLoginDto = createSampleDiscordLoginDto(index);
  const discordStateDto = createSampleDiscordStateDto();
  const discordResponse = createSampleDiscordResponse(index);
  const discordAxiosResponseData = createSampleDiscordAxiosResponse(index);
  const userWithDiscordAvatar = createSampleUserWithDiscordAvatar(index);
  const passportSessionUser = createSamplePassportSessionUser(
    userWithDiscordAvatar,
    index,
  );

  return {
    discordLoginDto,
    discordStateDto,
    discordResponse,
    discordAxiosResponseData,
    userWithDiscordAvatar,
    passportSessionUser,
  };
}

export const authSamples = [
  createSamples(0),
  createSamples(1),
  createSamples(2),
];
