import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { reqMock } from '@app/helpers/__tests__/mocks/express.mocks';
import { utilMock } from '@app/helpers/__tests__/mocks/util.mocks';
import { utilSymbol } from '@app/helpers/imports/imports.helper';
import { AuthService } from '@app/modules/auth/auth.service';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';

import { authSamples } from './samples/auth.samples';

describe('AuthService', () => {
  // Properties & methods

  let service: AuthService;

  let configService: ConfigService;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport()],
      providers: [
        AuthService,
        {
          provide: utilSymbol,
          useValue: utilMock,
        },
      ],
    }).compile();

    service = module.get(AuthService);

    configService = module.get(ConfigService);

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
    expect(service).toBeDefined();
  });

  describe('getDiscordLoginState', () => {
    it('should return an empty string if query contains state', () => {
      reqMock.query = authSamples[0].discordStateDto;

      const state = service.getDiscordLoginState(reqMock as {} as Request);

      expect(state).toEqual('');
    });

    it('should return login state if CORS origin is null', () => {
      reqMock.query = authSamples[0].discordLoginDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
      });

      const state = service.getDiscordLoginState(reqMock as {} as Request);

      expect(JSON.parse(decodeURIComponent(state))).toEqual(
        authSamples[0].discordLoginDto,
      );
    });

    it('should return login state if redirect URLs begin with the string CORS origin', () => {
      reqMock.query = authSamples[0].discordLoginDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [
          authSamples[0].discordLoginDto.successRedirectUrl,
          authSamples[0].discordLoginDto.failRedirectUrl,
        ],
      });

      const state = service.getDiscordLoginState(reqMock as {} as Request);

      expect(JSON.parse(decodeURIComponent(state))).toEqual(
        authSamples[0].discordLoginDto,
      );
    });

    it('should return login state if redirect URLs match with the regex CORS origin', () => {
      reqMock.query = authSamples[0].discordLoginDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/^https:\/\/sample-(success|fail)/],
      });

      const state = service.getDiscordLoginState(reqMock as {} as Request);

      expect(JSON.parse(decodeURIComponent(state))).toEqual(
        authSamples[0].discordLoginDto,
      );
    });

    it('should fail if redirect URLs does not begin with the string CORS orign', async () => {
      reqMock.query = authSamples[0].discordLoginDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: ['incorrect'],
      });

      await expect(
        new Promise(() => {
          service.getDiscordLoginState(reqMock as {} as Request);
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if redirect URLs does not match with the regex CORS orign', async () => {
      reqMock.query = authSamples[0].discordLoginDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/incorrect/],
      });

      await expect(
        new Promise(() => {
          service.getDiscordLoginState(reqMock as {} as Request);
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getRedirectUrl', () => {
    it('should return success redirect URL if user is successfully logged in and CORS origin is null', () => {
      reqMock.user = usersSamples[0].user;
      reqMock.query = authSamples[0].discordStateDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
      });

      const redirectUrl = service.getRedirectUrl(reqMock as {} as Request);

      expect(redirectUrl).toEqual(
        authSamples[0].discordLoginDto.successRedirectUrl,
      );
    });

    it('should return success redirect URL if user is successfully logged in and redirect URLs begin with the string CORS origin', () => {
      reqMock.user = usersSamples[0].user;
      reqMock.query = authSamples[0].discordStateDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [
          authSamples[0].discordLoginDto.successRedirectUrl,
          authSamples[0].discordLoginDto.failRedirectUrl,
        ],
      });

      const redirectUrl = service.getRedirectUrl(reqMock as {} as Request);

      expect(redirectUrl).toEqual(
        authSamples[0].discordLoginDto.successRedirectUrl,
      );
    });

    it('should return success redirect URL if user is successfully logged in and redirect URLs match with the regex CORS origin', () => {
      reqMock.user = usersSamples[0].user;
      reqMock.query = authSamples[0].discordStateDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/^https:\/\/sample-(success|fail)/],
      });

      const redirectUrl = service.getRedirectUrl(reqMock as {} as Request);

      expect(redirectUrl).toEqual(
        authSamples[0].discordLoginDto.successRedirectUrl,
      );
    });

    it('should return fail redirect URL if user failed to log in', () => {
      reqMock.user = null;
      reqMock.query = authSamples[0].discordStateDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
      });

      const redirectUrl = service.getRedirectUrl(reqMock as {} as Request);

      expect(redirectUrl).toEqual(
        authSamples[0].discordLoginDto.failRedirectUrl,
      );
    });

    it('should fail if state does not exist', async () => {
      reqMock.query = {};
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
      });

      await expect(
        new Promise(() => {
          service.getRedirectUrl(reqMock as {} as Request);
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if redirect URLs does not begin with the string CORS orign', async () => {
      reqMock.user = usersSamples[0].user;
      reqMock.query = authSamples[0].discordStateDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: ['incorrect'],
      });

      await expect(
        new Promise(() => {
          service.getRedirectUrl(reqMock as {} as Request);
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if redirect URLs does not match with the regex CORS orign', async () => {
      reqMock.user = usersSamples[0].user;
      reqMock.query = authSamples[0].discordStateDto;
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/incorrect/],
      });

      await expect(
        new Promise(() => {
          service.getRedirectUrl(reqMock as {} as Request);
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('logout', () => {
    const logoutAsync = jest.fn();
    const destroySessionAsync = jest.fn();

    beforeEach(() => {
      utilMock.promisify.mockReturnValueOnce(logoutAsync);
      utilMock.promisify.mockReturnValueOnce(destroySessionAsync);
    });

    it('should logout user', async () => {
      await service.logout(reqMock as {} as Request);

      expect(logoutAsync).toHaveBeenCalled();
    });

    it('should destroy session', async () => {
      await service.logout(reqMock as {} as Request);

      expect(destroySessionAsync).toHaveBeenCalled();
    });
  });

  describe('userinfo', () => {
    it('should return logged in user', () => {
      const user = service.userinfo(usersSamples[0].user);

      expect(user).toEqual(usersSamples[0].user);
    });
  });
});
