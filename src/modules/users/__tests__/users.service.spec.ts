import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { UsersDao } from '@app/modules/users/users.dao';
import { UsersService } from '@app/modules/users/users.service';

import { usersDaoMock } from './mocks/users.mocks';
import { usersSamples } from './samples/users.samples';

describe('UsersService', () => {
  // Properties & methods

  let service: UsersService;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport()],
      providers: [
        UsersService,
        {
          provide: UsersDao,
          useValue: usersDaoMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);

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

  describe('getMany', () => {
    beforeEach(() => {
      usersDaoMock.getMany.mockResolvedValue({
        totalCount: 2,
        users: [usersSamples[0].user, usersSamples[1].user],
      });
    });

    it('should return users', async () => {
      const users = await service.getMany({});

      expect(users).toEqual({
        totalCount: 2,
        users: [usersSamples[0].user, usersSamples[1].user],
      });
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);
    });

    it('should return a user', async () => {
      const user = await service.getById(usersSamples[0].user.id);

      expect(user).toEqual(usersSamples[0].user);
    });

    it('should fail if user does not exist', async () => {
      usersDaoMock.getById.mockResolvedValue(null);

      await expect(
        service.getById(usersSamples[0].user.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getByDiscordId', () => {
    beforeEach(() => {
      usersDaoMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);
    });

    it('should return a user', async () => {
      const user = await service.getByDiscordId(
        usersSamples[0].user.discord.id,
      );

      expect(user).toEqual(usersSamples[0].user);
    });

    it('should fail if user does not exist', async () => {
      usersDaoMock.getByDiscordId.mockResolvedValue(null);

      await expect(
        service.getByDiscordId(usersSamples[0].user.discord.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getByDiscordUsername', () => {
    beforeEach(() => {
      usersDaoMock.getByDiscordUsername.mockResolvedValue(usersSamples[0].user);
    });

    it('should return a user', async () => {
      const user = await service.getByDiscordUsername(
        usersSamples[0].user.discord.username,
      );

      expect(user).toEqual(usersSamples[0].user);
    });

    it('should fail if user does not exist', async () => {
      usersDaoMock.getByDiscordUsername.mockResolvedValue(null);

      await expect(
        service.getByDiscordUsername(usersSamples[0].user.discord.username),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateSuperAdminState', () => {
    beforeEach(() => {
      usersDaoMock.updateSuperAdminState.mockResolvedValue(
        usersSamples[0].user,
      );
    });

    it('should call "updateSuperAdminState" dao method', async () => {
      await service.updateSuperAdminState(
        usersSamples[0].user.id,
        usersSamples[0].updateSuperAdminStateDto,
      );

      expect(usersDaoMock.updateSuperAdminState).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call "delete" dao method', async () => {
      await service.delete(usersSamples[0].user.id, usersSamples[0].user);

      expect(usersDaoMock.delete).toHaveBeenCalled();
    });

    it('should fail if user is not a super admin and is deleting another user', async () => {
      await expect(
        service.delete(usersSamples[1].user.id, {
          ...usersSamples[0].user,
          isSuperAdmin: false,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
