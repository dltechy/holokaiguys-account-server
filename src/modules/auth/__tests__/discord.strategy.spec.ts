import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { axiosMock } from '@app/helpers/__tests__/mocks/axios.mocks';
import { filesHelperMock } from '@app/helpers/__tests__/mocks/files-helper.mocks';
import { uuidHelperMock } from '@app/helpers/__tests__/mocks/uuid.mocks';
import { FilesHelper } from '@app/helpers/files/files.helper';
import {
  axiosSymbol,
  DiscordStrategy as Strategy,
} from '@app/helpers/imports/imports.helper';
import { UuidHelper } from '@app/helpers/uuid/uuid.helper';
import { AuthService } from '@app/modules/auth/auth.service';
import { DiscordStrategy } from '@app/modules/auth/discord.strategy';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { UsersDao } from '@app/modules/users/users.dao';

import { authServiceMock } from './mocks/auth.mocks';
import { authSamples } from './samples/auth.samples';

describe('DiscordStrategy', () => {
  // Properties & methods

  let strategy: DiscordStrategy;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport()],
      providers: [
        DiscordStrategy,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: UsersDao,
          useValue: usersDaoMock,
        },
        {
          provide: FilesHelper,
          useValue: filesHelperMock,
        },
        {
          provide: UuidHelper,
          useValue: uuidHelperMock,
        },
        {
          provide: axiosSymbol,
          useValue: axiosMock,
        },
      ],
    }).compile();

    strategy = module.get(DiscordStrategy);

    return module;
  };

  // Before/after methods

  beforeAll(async () => {
    await initializeModule();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Tests

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('authenticate', () => {
    it('should succeed if user is already logged in', async () => {
      authServiceMock.createDiscordLoginState.mockReturnValue(
        authSamples[0].discordStateDto.state,
      );

      const success = jest.fn();
      strategy.success = success;

      const req = {
        query: {
          ...authSamples[0].discordLoginDto,
        },
        session: {
          passport: {
            user: authSamples[0].passportSessionUser,
          },
        },
      } as {} as Request;

      await strategy.authenticate(req);

      expect(req.query.state).toEqual(authSamples[0].discordStateDto.state);
      expect(success).toHaveBeenCalledWith(authSamples[0].passportSessionUser);
    });

    it('should pass the login state to Discord', async () => {
      authServiceMock.createDiscordLoginState.mockReturnValue(
        authSamples[0].discordStateDto.state,
      );

      const authenticate = jest
        .spyOn(Strategy.prototype, 'authenticate')
        .mockImplementation(jest.fn());

      const req = {
        query: {},
        session: {},
      } as {} as Request;

      await strategy.authenticate(req);

      expect(authenticate).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          state: authSamples[0].discordStateDto.state,
        }),
      );
    });
  });

  describe('validate', () => {
    it('should return ID of new user if it does not exist yet', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(usersSamples[0].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      const validatedData = await strategy.validate(
        '',
        '',
        authSamples[0].discordResponse,
      );

      expect(validatedData).toEqual({
        id: authSamples[0].passportSessionUser.id,
        tokens: [],
      });
    });

    it('should return ID of updated user if it already exists', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(usersSamples[1].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      const validatedData = await strategy.validate(
        '',
        '',
        authSamples[0].discordResponse,
      );

      expect(validatedData).toEqual({
        id: authSamples[1].passportSessionUser.id,
        tokens: [],
      });
    });

    it('should not include the discriminator in the saved username if it is null', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(usersSamples[0].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        discriminator: null,
      });

      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.objectContaining({
            username: authSamples[0].discordResponse.username,
          }),
        }),
      );
    });

    it('should not include the discriminator in the saved username if it is 0', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(usersSamples[0].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.objectContaining({
            username: authSamples[0].discordResponse.username,
          }),
        }),
      );
    });

    it('should include the discriminator in the saved username if it is neither null nor 0', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(usersSamples[0].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', authSamples[1].discordResponse);

      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.objectContaining({
            username: `${authSamples[1].discordResponse.username}#${authSamples[1].discordResponse.discriminator}`,
          }),
        }),
      );
    });

    it('should get the PNG avatar of the new user from Discord', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('sampleFilename');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.objectContaining({
            avatarFilename: 'sampleFilename',
          }),
        }),
      );
    });

    it('should get the PNG avatar of the existing user from Discord', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('sampleFilename');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(usersDaoMock.updateDiscordInfo).toHaveBeenCalledWith(
        authSamples[0].userWithDiscordAvatar.id,
        expect.objectContaining({
          avatarFilename: 'sampleFilename',
        }),
      );
    });

    it('should get the PNG and GIF avatars of the new user from Discord', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('sampleFilename');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: `a_${authSamples[0].discordResponse.avatar}`,
      });

      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringMatching(/\.gif$/),
        expect.anything(),
      );
      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.objectContaining({
            avatarFilename: 'sampleFilename',
          }),
        }),
      );
    });

    it('should get the PNG and GIF avatars of the existing user from Discord', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('sampleFilename');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: `a_${authSamples[0].discordResponse.avatar}`,
      });

      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringMatching(/\.gif$/),
        expect.anything(),
      );
      expect(usersDaoMock.updateDiscordInfo).toHaveBeenCalledWith(
        authSamples[0].userWithDiscordAvatar.id,
        expect.objectContaining({
          avatarFilename: 'sampleFilename',
        }),
      );
    });

    it('should return with a null object if the avatar hash of the new user is null', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(usersSamples[0].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: null,
      });

      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.not.objectContaining({
            avatarHash: null,
            avatarFilename: null,
          }),
        }),
      );
    });

    it('should return with a null object if the avatar hash of the existing user is null', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(usersSamples[0].user);
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: null,
      });

      expect(usersDaoMock.updateDiscordInfo).toHaveBeenCalledWith(
        authSamples[0].userWithDiscordAvatar.id,
        expect.objectContaining({
          avatarHash: null,
          avatarFilename: null,
        }),
      );
    });

    it('should return with a null object if getting the avatars of the new user from Discord failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockRejectedValue(new Error());

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(usersDaoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.not.objectContaining({
            avatarFilename: null,
          }),
        }),
      );
    });

    it('should return with a null object if getting the avatars of the existing user from Discord failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockRejectedValue(new Error());

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(usersDaoMock.updateDiscordInfo).toHaveBeenCalledWith(
        authSamples[0].userWithDiscordAvatar.id,
        expect.not.objectContaining({
          avatarFilename: null,
        }),
      );
    });

    it('should not get updated avatars of the existing user from Discord if their avatar is up to date', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockReturnValue(true);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(axiosMock.get).not.toHaveBeenCalled();
    });

    it('should get updated avatars of the existing user from Discord if their avatar hash has changed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockReturnValue(true);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: 'sampleUpdatedDiscordAvatarHash',
      });

      expect(axiosMock.get).toHaveBeenCalled();
    });

    it('should get updated avatars of the existing user from Discord if their PNG avatar does not exist', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockImplementation((_, filename: string) => {
        if (filename.endsWith('.png')) {
          return false;
        }
        return true;
      });

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(axiosMock.get).toHaveBeenCalled();
    });

    it('should get updated avatars of the existing user from Discord if the avatar hash begins with "a_" and their GIF avatar does not exist', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue({
        ...authSamples[0].userWithDiscordAvatar,
        discord: {
          ...authSamples[0].userWithDiscordAvatar.discord,
          avatarHash: `a_${authSamples[0].discordResponse.avatar}`,
        },
      });
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockImplementation((_, filename: string) => {
        if (filename.endsWith('.gif')) {
          return false;
        }
        return true;
      });

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: `a_${authSamples[0].discordResponse.avatar}`,
      });

      expect(axiosMock.get).toHaveBeenCalled();
    });

    it('should not get updated avatars of the existing user from Discord if the avatar hash does not begin with "a_" and their GIF avatar does not exist', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockImplementation((_, filename: string) => {
        if (filename.endsWith('.gif')) {
          return false;
        }
        return true;
      });

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(axiosMock.get).not.toHaveBeenCalled();
    });

    it('should delete the avatars of the existing user if they are not up to date and retrieving them from Discord has succeeded', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockReturnValue(true);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(filesHelperMock.delete).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.png$/),
      );
      expect(filesHelperMock.delete).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.gif$/),
      );
    });

    it('should not delete the avatars of the existing user if they are not up to date but retrieving them from Discord has failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockRejectedValue(new Error());
      filesHelperMock.exists.mockReturnValue(true);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(filesHelperMock.delete).not.toHaveBeenCalled();
    });

    it('should save PNG avatars of new users', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(filesHelperMock.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(filesHelperMock.save).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.gif$/),
        expect.anything(),
      );
    });

    it('should save PNG avatars of existing users', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockReturnValue(true);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(filesHelperMock.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(filesHelperMock.save).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.gif$/),
        expect.anything(),
      );
    });

    it('should save PNG and GIF avatars of new users if the avatar hash begins with "a_"', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: `a_${authSamples[0].discordResponse.avatar}`,
      });

      expect(filesHelperMock.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(filesHelperMock.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.gif$/),
        expect.anything(),
      );
    });

    it('should save PNG and GIF avatars of existing users if the avatar hash begins with "a_"', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);

      await strategy.validate('', '', {
        ...authSamples[0].discordResponse,
        avatar: `a_${authSamples[0].discordResponse.avatar}`,
      });

      expect(filesHelperMock.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.png$/),
        expect.anything(),
      );
      expect(filesHelperMock.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/\.gif$/),
        expect.anything(),
      );
    });

    it('should not save avatars of new users if retrieving them from Discord has failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockRejectedValue(new Error());

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(filesHelperMock.save).not.toHaveBeenCalled();
    });

    it('should not save avatars of existing users if retrieving them from Discord has failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockRejectedValue(new Error());
      filesHelperMock.exists.mockReturnValue(true);

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(filesHelperMock.save).not.toHaveBeenCalled();
    });

    it('should delete the avatar filename of new users if saving the files has failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);
      usersDaoMock.create.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.save.mockRejectedValue(new Error());

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(usersDaoMock.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          discord: expect.objectContaining({
            avatarFilename: null,
          }),
        }),
      );
    });

    it('should delete the avatar filename of existing users if saving the files has failed', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
      usersDaoMock.updateDiscordInfo.mockResolvedValue(
        authSamples[0].userWithDiscordAvatar,
      );
      uuidHelperMock.generate.mockReturnValue('');
      axiosMock.get.mockResolvedValue(authSamples[0].discordAxiosResponseData);
      filesHelperMock.exists.mockReturnValue(true);
      filesHelperMock.save.mockRejectedValue(new Error());

      await strategy.validate('', '', authSamples[0].discordResponse);

      expect(usersDaoMock.updateDiscordInfo).not.toHaveBeenCalledWith(
        authSamples[0].userWithDiscordAvatar.id,
        expect.objectContaining({
          avatarFilename: null,
        }),
      );
    });
  });
});
