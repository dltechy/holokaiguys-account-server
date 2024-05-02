import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AuthGuard } from '@app/guards/auth.guard';
import { DiscordAuthGuard } from '@app/guards/discord-auth.guard';
import { AuthController } from '@app/modules/auth/auth.controller';
import { AuthService } from '@app/modules/auth/auth.service';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';

import {
  authGuardMock,
  authServiceMock,
  discordAuthGuardMock,
} from './mocks/auth.mocks';

describe('AuthController', () => {
  // Properties & methods

  let app: INestApplication;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    })
      .overrideGuard(DiscordAuthGuard)
      .useValue(discordAuthGuardMock)
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
  });

  // Tests

  it('should connect to "GET /auth/discord/login"', async () => {
    discordAuthGuardMock.canActivate.mockResolvedValue(true);

    await request(app.getHttpServer()).get('/auth/discord/login');

    expect(discordAuthGuardMock.canActivate).toHaveBeenCalled();
  });

  it('should connect to "GET /auth/discord/callback"', async () => {
    discordAuthGuardMock.canActivate.mockResolvedValue(true);
    authServiceMock.getRedirectUrl.mockReturnValue('sampleRedirectUrl');

    const { redirect, header } = await request(app.getHttpServer()).get(
      '/auth/discord/callback',
    );

    expect(authServiceMock.getRedirectUrl).toHaveBeenCalled();
    expect(redirect).toEqual(true);
    expect(header.location).toEqual('sampleRedirectUrl');
  });

  it('should connect to "POST /auth/logout"', async () => {
    await request(app.getHttpServer()).post('/auth/logout');

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should connect to "GET /auth/userinfo"', async () => {
    authGuardMock.canActivate.mockResolvedValue(true);
    authServiceMock.userinfo.mockReturnValue(usersSamples[0].user);

    const { body } = await request(app.getHttpServer()).get('/auth/userinfo');

    expect(authServiceMock.userinfo).toHaveBeenCalled();
    expect(body).toEqual(usersSamples[0].userResponse);
  });
});
