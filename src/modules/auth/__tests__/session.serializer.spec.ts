import { Test, TestingModule } from '@nestjs/testing';

import { SessionSerializer } from '@app/modules/auth/session.serializer';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { User } from '@app/modules/users/schemas/user';
import { UsersDao } from '@app/modules/users/users.dao';

import { PassportSessionUser } from '../schemas/passport-session';
import { authSamples } from './samples/auth.samples';

describe('SessionSerializer', () => {
  // Properties & methods

  let serializer: SessionSerializer;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      providers: [
        SessionSerializer,
        {
          provide: UsersDao,
          useValue: usersDaoMock,
        },
      ],
    }).compile();

    serializer = module.get(SessionSerializer);

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
    expect(serializer).toBeDefined();
  });

  describe('serializeUser', () => {
    it('should serialize user', () => {
      expect.assertions(1);

      serializer.serializeUser(
        authSamples[0].passportSessionUser,
        (_error: Error, sessionUser: PassportSessionUser) => {
          expect(sessionUser).toEqual(authSamples[0].passportSessionUser);
        },
      );
    });

    it('should remove expired tokens from session', () => {
      expect.assertions(1);

      const now = new Date();

      const passportSessionUser = {
        ...authSamples[0].passportSessionUser,
        tokens: [
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + 1,
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              now.getDate(),
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear() + 1,
              now.getMonth(),
              now.getDate(),
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 1,
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate(),
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate(),
            ).toISOString(),
          },
        ],
      };

      serializer.serializeUser(
        passportSessionUser,
        (_error: Error, _sessionUser: PassportSessionUser) => {
          expect(passportSessionUser.tokens.length).toEqual(3);
        },
      );
    });
  });

  describe('deserializeUser', () => {
    it('should deserialize user', () => {
      expect.assertions(1);

      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);

      serializer.deserializeUser(
        authSamples[0].passportSessionUser,
        (_error: Error, user: User) => {
          expect(user).toEqual(usersSamples[0].user);
        },
      );
    });

    it('should return null if user does not exist', async () => {
      expect.assertions(1);

      serializer.deserializeUser(
        authSamples[0].passportSessionUser,
        (_error: Error, user: User) => {
          expect(user).toBeUndefined();
        },
      );
    });

    it('should remove expired tokens from session', () => {
      expect.assertions(1);

      const now = new Date();

      const passportSessionUser = {
        ...authSamples[0].passportSessionUser,
        tokens: [
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + 1,
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              now.getDate(),
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear() + 1,
              now.getMonth(),
              now.getDate(),
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 1,
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate(),
            ).toISOString(),
          },
          {
            authorizationCode: '',
            bearerToken: '',
            expiresAt: new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate(),
            ).toISOString(),
          },
        ],
      };

      serializer.deserializeUser(
        passportSessionUser,
        (_error: Error, _user: User) => {
          expect(passportSessionUser.tokens.length).toEqual(3);
        },
      );
    });
  });
});
