import { Test, TestingModule } from '@nestjs/testing';

import { SessionSerializer } from '@app/modules/auth/session.serializer';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { User } from '@app/modules/users/schemas/user';
import { UsersDao } from '@app/modules/users/users.dao';

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

      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);

      serializer.serializeUser(
        usersSamples[0].user,
        (error: Error, user: User) => {
          expect(user).toEqual(usersSamples[0].user);
        },
      );
    });

    it('should return null if user does not exist', async () => {
      expect.assertions(1);

      serializer.serializeUser(
        usersSamples[0].user,
        (error: Error, user: User) => {
          expect(user).toBeUndefined();
        },
      );
    });
  });

  describe('deserializeUser', () => {
    it('should deserialize user', () => {
      expect.assertions(1);

      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);

      serializer.deserializeUser(
        usersSamples[0].user,
        (error: Error, user: User) => {
          expect(user).toEqual(usersSamples[0].user);
        },
      );
    });

    it('should return null if user does not exist', async () => {
      expect.assertions(1);

      serializer.deserializeUser(
        usersSamples[0].user,
        (error: Error, user: User) => {
          expect(user).toBeUndefined();
        },
      );
    });
  });
});
