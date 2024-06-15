import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { BearerStrategy } from '@app/modules/auth/bearer.strategy';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { UsersDao } from '@app/modules/users/users.dao';

import { authSamples } from './samples/auth.samples';

describe('BearerStrategy', () => {
  // Properties & methods

  let strategy: BearerStrategy;

  let configService: ConfigService;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport()],
      providers: [
        BearerStrategy,
        {
          provide: UsersDao,
          useValue: usersDaoMock,
        },
      ],
    }).compile();

    strategy = module.get(BearerStrategy);

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
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if successfully validated', async () => {
      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);
      jest.spyOn(configService, 'get').mockReturnValue({
        sessionCookieMaxAge: 0,
      });

      const user = await strategy.validate(
        {
          session: {
            passport: {
              user: authSamples[0].passportSessionUser,
            },
          },
        } as {} as Request,
        authSamples[0].passportSessionUser.tokens[0].bearerToken,
      );

      expect(user).toEqual(usersSamples[0].user);
    });

    it('should return null if session does not exist', async () => {
      const user = await strategy.validate(
        {
          session: {},
        } as {} as Request,
        authSamples[0].passportSessionUser.tokens[0].bearerToken,
      );

      expect(user).toBeNull();
    });

    it('should return null if stored token is expired', async () => {
      const now = new Date();

      const user = await strategy.validate(
        {
          session: {
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
          },
        } as {} as Request,
        authSamples[0].passportSessionUser.tokens[0].bearerToken,
      );

      expect(user).toBeNull();
    });

    it('should return null if bearer token does not match stored value', async () => {
      const now = new Date();

      const user = await strategy.validate(
        {
          session: {
            passport: {
              user: {
                ...authSamples[0].passportSessionUser,
                tokens: [
                  {
                    authorizationCode: '',
                    bearerToken: 'sampleBearerToken',
                    expiresAt: new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() + 1,
                    ).toISOString(),
                  },
                ],
              },
            },
          },
        } as {} as Request,
        'sampleInvalidBearerToken',
      );

      expect(user).toBeNull();
    });
  });
});
