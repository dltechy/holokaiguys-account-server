import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { reqMock } from '@app/helpers/__tests__/mocks/express.mocks';
import { redisServiceMock } from '@app/helpers/__tests__/mocks/redis.mocks';
import { utilMock } from '@app/helpers/__tests__/mocks/util.mocks';
import { uuidHelperMock } from '@app/helpers/__tests__/mocks/uuid.mocks';
import { utilSymbol } from '@app/helpers/imports/imports.helper';
import { UuidHelper } from '@app/helpers/uuid/uuid.helper';
import { AuthService } from '@app/modules/auth/auth.service';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { RedisService } from '@app/providers/redis/redis.service';

import { PassportSession } from '../schemas/passport-session';
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
          provide: RedisService,
          useValue: redisServiceMock,
        },
        {
          provide: UuidHelper,
          useValue: uuidHelperMock,
        },
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

  describe('createDiscordLoginState', () => {
    it('should return passed state if query contains state', async () => {
      const state = await service.createDiscordLoginState(
        authSamples[0].discordStateDto.state,
        authSamples[0].discordLoginDto,
      );

      expect(state).toEqual(authSamples[0].discordStateDto.state);
    });

    it('should return login state if CORS origin is null', async () => {
      uuidHelperMock.generate.mockReturnValue(
        authSamples[0].discordStateDto.state,
      );
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
      });

      const state = await service.createDiscordLoginState(
        undefined,
        authSamples[0].discordLoginDto,
      );

      expect(state).toEqual(authSamples[0].discordStateDto.state);
    });

    it('should return login state if origin of redirect URLs match with the string CORS origin', async () => {
      uuidHelperMock.generate.mockReturnValue(
        authSamples[0].discordStateDto.state,
      );
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [
          authSamples[0].discordLoginDto.successRedirectUrl,
          authSamples[0].discordLoginDto.failRedirectUrl,
        ],
      });

      const state = await service.createDiscordLoginState(
        undefined,
        authSamples[0].discordLoginDto,
      );

      expect(state).toEqual(authSamples[0].discordStateDto.state);
    });

    it('should return login state if redirect URLs match with the regex CORS origin', async () => {
      uuidHelperMock.generate.mockReturnValue(
        authSamples[0].discordStateDto.state,
      );
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/^https:\/\/sample-(success|fail)/],
      });

      const state = await service.createDiscordLoginState(
        undefined,
        authSamples[0].discordLoginDto,
      );

      expect(state).toEqual(authSamples[0].discordStateDto.state);
    });

    it('should fail if origin of redirect URLs does not match with the string CORS orign', async () => {
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: ['https://incorrect'],
      });

      await expect(
        service.createDiscordLoginState(
          undefined,
          authSamples[0].discordLoginDto,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if redirect URLs does not match with the regex CORS orign', async () => {
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/incorrect/],
      });

      await expect(
        service.createDiscordLoginState(
          undefined,
          authSamples[0].discordLoginDto,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getRedirectUrl', () => {
    it('should return success redirect URL if user is successfully logged in and CORS origin is null', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      const redirectUrl = await service.getRedirectUrl(
        authSamples[0].discordStateDto.state,
        usersSamples[0].user,
        {
          passport: {
            user: authSamples[0].passportSessionUser,
          },
        } as {} as PassportSession,
      );

      expect(redirectUrl).toEqual(
        `${authSamples[0].discordLoginDto.successRedirectUrl}/?code=sampleCode`,
      );
    });

    it('should return success redirect URL if user is successfully logged in and origin of redirect URLs match with the string CORS origin', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [
          authSamples[0].discordLoginDto.successRedirectUrl,
          authSamples[0].discordLoginDto.failRedirectUrl,
        ],
        sessionCookieMaxAge: 0,
      });

      const redirectUrl = await service.getRedirectUrl(
        authSamples[0].discordStateDto.state,
        usersSamples[0].user,
        {
          passport: {
            user: authSamples[0].passportSessionUser,
          },
        } as {} as PassportSession,
      );

      expect(redirectUrl).toEqual(
        `${authSamples[0].discordLoginDto.successRedirectUrl}/?code=sampleCode`,
      );
    });

    it('should return success redirect URL if user is successfully logged in and redirect URLs match with the regex CORS origin', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/^https:\/\/sample-(success|fail)/],
        sessionCookieMaxAge: 0,
      });

      const redirectUrl = await service.getRedirectUrl(
        authSamples[0].discordStateDto.state,
        usersSamples[0].user,
        {
          passport: {
            user: authSamples[0].passportSessionUser,
          },
        } as {} as PassportSession,
      );

      expect(redirectUrl).toEqual(
        `${authSamples[0].discordLoginDto.successRedirectUrl}/?code=sampleCode`,
      );
    });

    it('should return fail redirect URL if user failed to log in', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      const redirectUrl = await service.getRedirectUrl(
        authSamples[0].discordStateDto.state,
        null,
        {} as PassportSession,
      );

      expect(redirectUrl).toEqual(
        authSamples[0].discordLoginDto.failRedirectUrl,
      );
    });

    it('should delete state from Redis', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      await service.getRedirectUrl(
        authSamples[0].discordStateDto.state,
        usersSamples[0].user,
        {
          passport: {
            user: authSamples[0].passportSessionUser,
          },
        } as {} as PassportSession,
      );

      expect(redisServiceMock.del).toHaveBeenCalled();
    });

    it('should fail if state does not exist', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      await expect(
        service.getRedirectUrl(
          null,
          usersSamples[0].user,
          {} as PassportSession,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if origin of redirect URLs does not match with the string CORS orign', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: ['https://incorrect'],
        sessionCookieMaxAge: 0,
      });

      await expect(
        service.getRedirectUrl(
          authSamples[0].discordStateDto.state,
          usersSamples[0].user,
          {} as PassportSession,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if state does not exist in Redis', async () => {
      redisServiceMock.get.mockResolvedValue(null);
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      await expect(
        service.getRedirectUrl(
          authSamples[0].discordStateDto.state,
          usersSamples[0].user,
          {} as PassportSession,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if state exists in Redis but is invalid', async () => {
      redisServiceMock.get.mockResolvedValue('{}');
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      await expect(
        service.getRedirectUrl(
          authSamples[0].discordStateDto.state,
          usersSamples[0].user,
          {} as PassportSession,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if redirect URLs does not match with the regex CORS orign', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: [/incorrect/],
        sessionCookieMaxAge: 0,
      });

      await expect(
        service.getRedirectUrl(
          authSamples[0].discordStateDto.state,
          usersSamples[0].user,
          {} as PassportSession,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should fail if session does not exist', async () => {
      redisServiceMock.get.mockResolvedValue(
        JSON.stringify(authSamples[0].discordLoginDto),
      );
      uuidHelperMock.generate.mockReturnValue('sampleCode');
      jest.spyOn(configService, 'get').mockReturnValue({
        corsOrigin: null,
        sessionCookieMaxAge: 0,
      });

      await expect(
        service.getRedirectUrl(
          authSamples[0].discordStateDto.state,
          usersSamples[0].user,
          {} as PassportSession,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('token', () => {
    it('should return new bearer token if user is logged in and has the correct authorization code which has not yet expired', () => {
      const now = new Date();

      uuidHelperMock.generate.mockReturnValue('sampleBearerToken');

      const bearerToken = service.token('sampleAuthorizationCode', {
        passport: {
          user: {
            ...authSamples[0].passportSessionUser,
            tokens: [
              {
                authorizationCode: 'sampleAuthorizationCode',
                bearerToken: '',
                expiresAt: new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate() + 1,
                ).toISOString(),
              },
            ],
          },
        },
      } as PassportSession);

      expect(bearerToken).toEqual({
        bearerToken: 'sampleBearerToken',
      });
    });

    it('should fail if session does not exist', async () => {
      await expect(
        new Promise(() => {
          service.token('sampleAuthorizationCode', {} as PassportSession);
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should fail if stored token is expired', async () => {
      const now = new Date();

      await expect(
        new Promise(() => {
          service.token('sampleAuthorizationCode', {
            passport: {
              user: {
                ...authSamples[0].passportSessionUser,
                tokens: [
                  {
                    authorizationCode: 'sampleAuthorizationCode',
                    bearerToken: '',
                    expiresAt: new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() - 1,
                    ).toISOString(),
                  },
                ],
              },
            },
          } as PassportSession);
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should fail if authorization code does not match stored value', async () => {
      const now = new Date();

      await expect(
        new Promise(() => {
          service.token('sampleInvalidAuthorizationCode', {
            passport: {
              user: {
                ...authSamples[0].passportSessionUser,
                tokens: [
                  {
                    authorizationCode: 'sampleAuthorizationCode',
                    bearerToken: '',
                    expiresAt: new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() + 1,
                    ).toISOString(),
                  },
                ],
              },
            },
          } as PassportSession);
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
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
