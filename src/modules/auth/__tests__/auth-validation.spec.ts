import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpMethod } from '@app/constants/http-request.constants';
import { AuthGuard } from '@app/guards/auth.guard';
import { DiscordAuthGuard } from '@app/guards/discord-auth.guard';
import { createQueryValidationTests } from '@app/helpers/__tests__/validation/query-validation.helper';
import { initializeGlobalPipes } from '@app/helpers/initialization/global-pipes-initialization.helper';
import { AuthController } from '@app/modules/auth/auth.controller';
import { AuthService } from '@app/modules/auth/auth.service';

import {
  authGuardMock,
  authServiceMock,
  discordAuthGuardMock,
} from './mocks/auth.mocks';
import { authSamples } from './samples/auth.samples';

describe('UsersController (validation)', () => {
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

    initializeGlobalPipes(app);

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

  describe('discordLogin', () => {
    const requiredQuery = {
      ...authSamples[0].discordLoginDto,
    };

    createQueryValidationTests({
      appGetter: () => app,
      beforeEach: () => {
        discordAuthGuardMock.canActivate.mockResolvedValue(true);
      },
      requiredQuery,
      httpMethod: HttpMethod.Get,
      path: '/auth/discord/login',
      expectedSuccessStatusCode: 302,
      propertyTestValues: [
        {
          property: 'successRedirectUrl',
          successValues: ['https://localhost'],
          failValues: ['localhost', 'string', ''],
        },
        {
          property: 'failRedirectUrl',
          successValues: ['https://localhost'],
          failValues: ['localhost', 'string', ''],
        },
      ],
    });
  });
});
