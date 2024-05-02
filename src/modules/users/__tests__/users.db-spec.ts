import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SortOrder } from '@app/constants/pagination.constants';
import { createUserDbEntry } from '@app/helpers/__tests__/db-entry-creation/user-creation.helper';
import { createRethrowUnknownErrorAsyncTest } from '@app/helpers/__tests__/errors/error-tests.helper';
import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { GetUsersSortBy } from '@app/modules/users/dtos/get-users.dto';
import { UsersDao } from '@app/modules/users/users.dao';
import { PrismaModule } from '@app/providers/prisma/prisma.module';
import { PrismaService } from '@app/providers/prisma/prisma.service';

import { usersSamples } from './samples/users.samples';

describe('UsersDao', () => {
  // Properties & methods

  let dao: UsersDao;

  let prismaService: PrismaService;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule, getConfigImport()],
      providers: [UsersDao],
    }).compile();

    dao = module.get(UsersDao);

    prismaService = module.get(PrismaService);

    return module;
  };

  const cleanupStorage = async (): Promise<void> => {
    await prismaService.user.deleteMany();
  };

  // Before/after methods

  beforeAll(async () => {
    await initializeModule();
  });

  afterAll(async () => {
    await cleanupStorage();
  });

  beforeEach(async () => {
    jest.resetAllMocks();
  });

  // Tests

  describe('create', () => {
    it('should create new user', async () => {
      await cleanupStorage();

      const newUser = await dao.create(usersSamples[0].createModel);

      expect(newUser).toEqual(usersSamples[0].daoOutput);
    });

    it('should fail if Discord ID is already in use', async () => {
      await expect(
        dao.create({
          ...usersSamples[1].createModel,
          discord: {
            ...usersSamples[1].createModel.discord,
            id: usersSamples[0].user.discord.id,
          },
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should fail if Discord username is already taken', async () => {
      await expect(
        dao.create({
          ...usersSamples[1].createModel,
          discord: {
            ...usersSamples[1].createModel.discord,
            username: usersSamples[0].user.discord.username,
          },
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    createRethrowUnknownErrorAsyncTest({
      mockedObjectGetter: () => prismaService.user,
      mockedMethod: 'create',
      testedPromiseGetter: () => dao.create(usersSamples[0].createModel),
    });
  });

  describe('getMany', () => {
    beforeAll(async () => {
      await cleanupStorage();

      await createUserDbEntry(prismaService, usersSamples[0]);
      await createUserDbEntry(prismaService, usersSamples[1]);
      await createUserDbEntry(prismaService, usersSamples[2]);
    });

    it('should get users', async () => {
      const users = await dao.getMany({});

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[0].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
        ],
      });
    });

    it('should filter users by super admin flag', async () => {
      const users = await dao.getMany({
        isSuperAdmin: true,
      });

      expect(users).toEqual({
        totalCount: 1,
        users: [usersSamples[0].daoOutput],
      });
    });

    it('should filter users by case insensitive partial Discord username', async () => {
      const users = await dao.getMany({
        discordUsername: 'username1',
      });

      expect(users).toEqual({
        totalCount: 1,
        users: [usersSamples[1].daoOutput],
      });
    });

    it('should filter users by case insensitive partial Discord display name', async () => {
      const users = await dao.getMany({
        discordDisplayName: 'displayname1',
      });

      expect(users).toEqual({
        totalCount: 1,
        users: [usersSamples[1].daoOutput],
      });
    });

    it('should get users from page 2', async () => {
      const users = await dao.getMany({
        page: 2,
        count: 1,
        sortBy: GetUsersSortBy.CreatedAt,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [usersSamples[1].daoOutput],
      });
    });

    it('should get 2 users', async () => {
      const users = await dao.getMany({
        page: 1,
        count: 2,
        sortBy: GetUsersSortBy.CreatedAt,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [usersSamples[0].daoOutput, usersSamples[1].daoOutput],
      });
    });

    it('should get users sorted ascending by super admin flag', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.IsSuperAdmin,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
          usersSamples[0].daoOutput,
        ],
      });
    });

    it('should get users sorted descending by super admin flag', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.IsSuperAdmin,
        sortOrder: SortOrder.Desc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[0].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
        ],
      });
    });

    it('should get users sorted ascending by Discord username', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.DiscordUsername,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[0].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
        ],
      });
    });

    it('should get users sorted descending by Discord username', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.DiscordUsername,
        sortOrder: SortOrder.Desc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[2].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[0].daoOutput,
        ],
      });
    });

    it('should get users sorted ascending by Discord display name', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.DiscordDisplayName,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[0].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
        ],
      });
    });

    it('should get users sorted descending by Discord display name', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.DiscordDisplayName,
        sortOrder: SortOrder.Desc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[2].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[0].daoOutput,
        ],
      });
    });

    it('should get users sorted ascending by created at', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.CreatedAt,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[0].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
        ],
      });
    });

    it('should get users sorted descending by created at', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.CreatedAt,
        sortOrder: SortOrder.Desc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[2].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[0].daoOutput,
        ],
      });
    });

    it('should get users sorted ascending by updated at', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.UpdatedAt,
        sortOrder: SortOrder.Asc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[0].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[2].daoOutput,
        ],
      });
    });

    it('should get users sorted descending by updated at', async () => {
      const users = await dao.getMany({
        sortBy: GetUsersSortBy.UpdatedAt,
        sortOrder: SortOrder.Desc,
      });

      expect(users).toEqual({
        totalCount: 3,
        users: [
          usersSamples[2].daoOutput,
          usersSamples[1].daoOutput,
          usersSamples[0].daoOutput,
        ],
      });
    });
  });

  describe('getById', () => {
    it('should get user', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      const user = await dao.getById(usersSamples[0].user.id);

      expect(user).toEqual(usersSamples[0].daoOutput);
    });

    it('should return null if user does not exist', async () => {
      await cleanupStorage();

      const user = await dao.getById(usersSamples[0].user.id);

      expect(user).toBeNull();
    });
  });

  describe('getByDiscordId', () => {
    it('should get user', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      const user = await dao.getByDiscordId(usersSamples[0].user.discord.id);

      expect(user).toEqual(usersSamples[0].daoOutput);
    });

    it('should return null if user does not exist', async () => {
      await cleanupStorage();

      const user = await dao.getByDiscordId(usersSamples[0].user.discord.id);

      expect(user).toBeNull();
    });
  });

  describe('getByDiscordUsername', () => {
    it('should get user', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      const user = await dao.getByDiscordUsername(
        usersSamples[0].user.discord.username,
      );

      expect(user).toEqual(usersSamples[0].daoOutput);
    });

    it('should return null if user does not exist', async () => {
      await cleanupStorage();

      const user = await dao.getByDiscordUsername(
        usersSamples[0].user.discord.username,
      );

      expect(user).toBeNull();
    });
  });

  describe('updateSuperAdminState', () => {
    it('should update the super admin state of the user', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      const user = await dao.updateSuperAdminState(
        usersSamples[0].user.id,
        usersSamples[0].updateSuperAdminStateDto,
      );

      expect(user.isSuperAdmin).toEqual(
        usersSamples[0].updateSuperAdminStateDto.isSuperAdmin,
      );
    });

    it('should fail if user does not exist', async () => {
      await expect(
        dao.updateSuperAdminState(
          usersSamples[1].user.id,
          usersSamples[1].updateSuperAdminStateDto,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    createRethrowUnknownErrorAsyncTest({
      mockedObjectGetter: () => prismaService.user,
      mockedMethod: 'update',
      testedPromiseGetter: () =>
        dao.updateSuperAdminState(
          usersSamples[0].user.id,
          usersSamples[0].updateSuperAdminStateDto,
        ),
    });
  });

  describe('updateDiscordInfo', () => {
    it('should update the Discord info of the user', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      const user = await dao.updateDiscordInfo(
        usersSamples[0].user.id,
        usersSamples[0].updateDiscordInfoDto,
      );

      expect(user.discord).toEqual(
        expect.objectContaining({
          username: usersSamples[0].updateDiscordInfoDto.username,
          displayName: usersSamples[0].updateDiscordInfoDto.displayName,
        }),
      );
    });

    it('should work even if the update data is empty', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      const user = await dao.updateDiscordInfo(usersSamples[0].user.id, {});

      expect(user.discord).toEqual(
        expect.objectContaining({
          username: usersSamples[0].user.discord.username,
          displayName: usersSamples[0].user.discord.displayName,
        }),
      );
    });

    it('should fail if user does not exist', async () => {
      await expect(
        dao.updateDiscordInfo(
          usersSamples[1].user.id,
          usersSamples[1].updateDiscordInfoDto,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should fail if new username is already taken', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);
      await createUserDbEntry(prismaService, usersSamples[1]);

      await expect(
        dao.updateDiscordInfo(usersSamples[1].user.id, {
          username: usersSamples[0].user.discord.username,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    createRethrowUnknownErrorAsyncTest({
      mockedObjectGetter: () => prismaService.user,
      mockedMethod: 'update',
      testedPromiseGetter: () =>
        dao.updateDiscordInfo(
          usersSamples[0].user.id,
          usersSamples[0].updateDiscordInfoDto,
        ),
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      await cleanupStorage();
      await createUserDbEntry(prismaService, usersSamples[0]);

      await expect(
        dao.delete(usersSamples[0].user.id),
      ).resolves.toBeUndefined();

      const user = await dao.getById(usersSamples[0].user.id);

      expect(user).toBeNull();
    });

    it('should fail if user does not exist', async () => {
      await expect(dao.delete(usersSamples[0].user.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    createRethrowUnknownErrorAsyncTest({
      mockedObjectGetter: () => prismaService.user,
      mockedMethod: 'delete',
      testedPromiseGetter: () => dao.delete(usersSamples[0].user.id),
    });
  });
});
