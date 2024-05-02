import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { AppConfig } from '@app/config/interfaces/app.config';
import { DiscordConfig } from '@app/config/interfaces/discord.config';
import { FilesSubdirectory } from '@app/constants/file.constants';
import { FilesHelper } from '@app/helpers/files/files.helper';
import {
  axiosSymbol,
  AxiosType,
  DiscordStrategy as Strategy,
  uuidSymbol,
  UuidType,
  Uuidv4Type,
} from '@app/helpers/imports/imports.helper';
import { User } from '@app/modules/users/schemas/user';

import { UsersDao } from '../users/users.dao';
import { AuthService } from './auth.service';

type AvatarImages = {
  filename: string;
  pngData: string;
  gifData?: string;
};

@Injectable()
export class DiscordStrategy extends Strategy {
  private readonly uuidv4: Uuidv4Type;

  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersDao: UsersDao,
    private readonly filesHelper: FilesHelper,
    @Inject(axiosSymbol) private readonly axios: AxiosType,
    @Inject(uuidSymbol) uuid: UuidType,
  ) {
    const { baseUrl } = configService.get<AppConfig>('app');
    const { clientId, clientSecret, scopes } =
      configService.get<DiscordConfig>('discord');

    super({
      clientID: clientId,
      clientSecret,
      callbackURL: `${baseUrl}/auth/discord/callback`,
      scope: scopes,
    });

    this.uuidv4 = uuid.v4;
  }

  public authenticate(req: Request): void {
    const state = this.authService.getDiscordLoginState(req);

    super.authenticate(req, {
      failWithError: true,
      state,
    });
  }

  private async getAvatarImages(
    userId: string,
    avatarHash: string,
  ): Promise<AvatarImages> {
    if (avatarHash == null) {
      return null;
    }

    try {
      const output: AvatarImages = {
        filename: this.uuidv4().replaceAll('-', ''),
        pngData: '',
      };

      const { data: pngData } = await this.axios.get(
        `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`,
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'image/png',
          },
        },
      );
      output.pngData = pngData;

      if (avatarHash.startsWith('a_')) {
        const { data: gifData } = await this.axios.get(
          `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.gif`,
          {
            responseType: 'arraybuffer',
            headers: {
              'Content-Type': 'image/gif',
            },
          },
        );
        output.gifData = gifData;
      }

      return output;
    } catch (e) {
      return null;
    }
  }

  private async getUpdatedAvatarImages(
    user: User,
    avatarHash: string,
  ): Promise<AvatarImages> {
    if (avatarHash == null) {
      return null;
    }

    let isAvatarUpToDate = true;
    if (user.discord.avatarHash !== avatarHash) {
      isAvatarUpToDate = false;
    }

    if (
      !this.filesHelper.exists(
        FilesSubdirectory.Avatars,
        `${user.discord.avatarFilename}.png`,
      )
    ) {
      isAvatarUpToDate = false;
    }

    if (
      avatarHash.startsWith('a_') &&
      !this.filesHelper.exists(
        FilesSubdirectory.Avatars,
        `${user.discord.avatarFilename}.gif`,
      )
    ) {
      isAvatarUpToDate = false;
    }

    if (!isAvatarUpToDate) {
      const avatarImages = await this.getAvatarImages(
        user.discord.id,
        avatarHash,
      );

      if (avatarImages != null) {
        await this.filesHelper.delete(
          FilesSubdirectory.Avatars,
          `${user.discord.avatarFilename}.png`,
        );
        await this.filesHelper.delete(
          FilesSubdirectory.Avatars,
          `${user.discord.avatarFilename}.gif`,
        );
      }

      return avatarImages;
    }

    return null;
  }

  private async saveAvatarImages(avatarImages: AvatarImages): Promise<void> {
    if (avatarImages == null) {
      return;
    }

    const { filename, pngData, gifData } = avatarImages;
    try {
      await this.filesHelper.save(
        FilesSubdirectory.Avatars,
        `${filename}.png`,
        pngData,
      );
      if (gifData != null) {
        await this.filesHelper.save(
          FilesSubdirectory.Avatars,
          `${filename}.gif`,
          gifData,
        );
      }
    } catch (e) {
      // Ignore failing save.
    }
  }

  public async validate(
    _accessToken: string,
    _refreshToken: string,
    {
      id,
      username,
      discriminator,
      global_name: displayName,
      avatar: avatarHash,
    }: {
      /* eslint-disable @typescript-eslint/naming-convention */
      id: string;
      username: string;
      discriminator: string;
      global_name: string;
      avatar: string;
      /* eslint-enable @typescript-eslint/naming-convention */
    },
  ): Promise<User> {
    const uniqueUsername =
      !discriminator || discriminator === '0'
        ? username
        : `${username}#${discriminator}`;

    let user = await this.usersDao.getByDiscordId(id);
    if (user == null) {
      const avatarImages = await this.getAvatarImages(id, avatarHash);

      user = await this.usersDao.create({
        isSuperAdmin: false,
        discord: {
          id,
          username: uniqueUsername,
          displayName,
          ...(avatarHash != null
            ? {
                avatarHash,
                ...(avatarImages != null
                  ? {
                      avatarFilename: avatarImages.filename,
                    }
                  : {}),
              }
            : {}),
        },
      });

      await this.saveAvatarImages(avatarImages);
    } else {
      const avatarImages = await this.getUpdatedAvatarImages(user, avatarHash);

      user = await this.usersDao.updateDiscordInfo(user.id, {
        username: uniqueUsername,
        displayName,
        ...(avatarHash != null
          ? {
              avatarHash,
              ...(avatarImages != null
                ? {
                    avatarFilename: avatarImages.filename,
                  }
                : {}),
            }
          : {
              avatarHash: null,
              avatarFilename: null,
            }),
      });

      await this.saveAvatarImages(avatarImages);
    }

    return user;
  }
}
