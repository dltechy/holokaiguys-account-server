import {
  Controller,
  Get,
  INestApplication,
  mixin,
  Type,
  UseGuards,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { DiscordLoginHelperSerializer } from '@app/helpers/__tests__/guards/discord-login-helper.serializer';
import { DiscordLoginHelperStrategy } from '@app/helpers/__tests__/guards/discord-login-helper.strategy';
import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { getSessionImports } from '@app/helpers/__tests__/imports/session-imports.helper';
import { initializeSession } from '@app/helpers/initialization/session-initialization.helper';

import { DiscordAuthGuard } from '../discord-auth.guard';

describe('DiscordAuthGuard', () => {
  // Properties & methods

  let app: INestApplication;

  const createTestController = (): Type<unknown> => {
    @Controller('test')
    class TestController {
      @UseGuards(DiscordAuthGuard)
      @Get()
      public test(): void {
        // Do nothing
      }
    }

    return mixin(TestController);
  };

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport(), ...getSessionImports()],
      controllers: [createTestController()],
      providers: [DiscordLoginHelperStrategy, DiscordLoginHelperSerializer],
    }).compile();

    return module;
  };

  const initializeApp = async (module: TestingModule): Promise<void> => {
    app = module.createNestApplication(undefined, {
      logger: false,
    });

    initializeSession(app);

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

  beforeEach(async () => {
    jest.resetAllMocks();
  });

  // Tests

  it('should succeed if query does not contain an error', async () => {
    const { statusCode } = await request(app.getHttpServer())
      .get('/test')
      .send();

    expect(statusCode).toEqual(200);
  });

  it('should succeed even if query contains an error', async () => {
    const { statusCode } = await request(app.getHttpServer())
      .get('/test')
      .query({
        error: 'sampleError',
      })
      .send();

    expect(statusCode).toEqual(200);
  });
});
