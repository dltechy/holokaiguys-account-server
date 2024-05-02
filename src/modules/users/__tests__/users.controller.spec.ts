import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AuthGuard } from '@app/guards/auth.guard';
import { authGuardMock } from '@app/modules/auth/__tests__/mocks/auth.mocks';
import { UsersController } from '@app/modules/users/users.controller';
import { UsersService } from '@app/modules/users/users.service';

import { usersServiceMock } from './mocks/users.mocks';
import { usersSamples } from './samples/users.samples';

describe('UsersController', () => {
  // Properties & methods

  let app: INestApplication;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();

    return module;
  };

  const initializeApp = async (module: TestingModule): Promise<void> => {
    app = module.createNestApplication(undefined, {
      logger: false,
    });

    await app.init();
  };

  // Before/after methods

  beforeAll(async () => {
    const module = await initializeModule();
    await initializeApp(module);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    authGuardMock.canActivate.mockResolvedValue(true);
  });

  // Tests

  it('should connect to "GET /users"', async () => {
    usersServiceMock.getMany.mockResolvedValue({
      totalCount: 2,
      users: [usersSamples[0].user, usersSamples[1].user],
    });

    const { body } = await request(app.getHttpServer()).get('/users');

    expect(usersServiceMock.getMany).toHaveBeenCalled();
    expect(body).toEqual({
      totalCount: 2,
      users: [usersSamples[0].userResponse, usersSamples[1].userResponse],
    });
  });

  it('should connect to "GET /users/:id"', async () => {
    usersServiceMock.getById.mockResolvedValue(usersSamples[0].user);

    const { body } = await request(app.getHttpServer())
      .get('/users/00000000-0000-4000-8000-000000000000')
      .send();

    expect(usersServiceMock.getById).toHaveBeenCalled();
    expect(body).toEqual(usersSamples[0].userResponse);
  });

  it('should connect to "GET /users/discord/ids/:discordId"', async () => {
    usersServiceMock.getByDiscordId.mockResolvedValue(usersSamples[0].user);

    const { body } = await request(app.getHttpServer()).get(
      '/users/discord/ids/sampleDiscordId',
    );

    expect(usersServiceMock.getByDiscordId).toHaveBeenCalled();
    expect(body).toEqual(usersSamples[0].userResponse);
  });

  it('should connect to "GET /users/discord/usernames/:discordUsername"', async () => {
    usersServiceMock.getByDiscordUsername.mockResolvedValue(
      usersSamples[0].user,
    );

    const { body } = await request(app.getHttpServer()).get(
      '/users/discord/usernames/sampleDiscordUsername',
    );

    expect(usersServiceMock.getByDiscordUsername).toHaveBeenCalled();
    expect(body).toEqual(usersSamples[0].userResponse);
  });

  it('should connect to "PATCH /users/:id/super-admin-state"', async () => {
    await request(app.getHttpServer()).patch(
      '/users/00000000-0000-4000-8000-000000000000/super-admin-state',
    );

    expect(usersServiceMock.updateSuperAdminState).toHaveBeenCalled();
  });

  it('should connect to "DELETE /users/:id"', async () => {
    await request(app.getHttpServer()).delete(
      '/users/00000000-0000-4000-8000-000000000000',
    );

    expect(usersServiceMock.delete).toHaveBeenCalled();
  });
});
