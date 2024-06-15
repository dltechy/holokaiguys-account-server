import { Controller, Get, INestApplication, mixin, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { UseBearerAuthGuard } from '@app/guards/bearer-auth.guard';
import { BearerLoginHelperStrategy } from '@app/helpers/__tests__/guards/bearer-login-helper.strategy';
import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { getSessionImports } from '@app/helpers/__tests__/imports/session-imports.helper';
import { initializeSession } from '@app/helpers/initialization/session-initialization.helper';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';
import { UsersDao } from '@app/modules/users/users.dao';

describe('BearerAuthGuard', () => {
  // Properties & methods

  let app: INestApplication;

  const createTestController = (): Type<unknown> => {
    @Controller('test')
    class TestController {
      @UseBearerAuthGuard()
      @Get('any-user')
      public anyUser(): void {
        // Do nothing
      }

      @UseBearerAuthGuard({
        isSuperAdmin: true,
      })
      @Get('super-admin')
      public superAdmin(): void {
        // Do nothing
      }

      @UseBearerAuthGuard({
        isSuperAdmin: false,
      })
      @Get('non-super-admin')
      public nonSuperAdmin(): void {
        // Do nothing
      }
    }

    return mixin(TestController);
  };

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport(), ...getSessionImports()],
      controllers: [createTestController()],
      providers: [
        BearerLoginHelperStrategy,
        {
          provide: UsersDao,
          useValue: usersDaoMock,
        },
      ],
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

  describe('anyUser', () => {
    it('should allow access if user is logged in', async () => {
      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/any-user')
        .send();

      expect(statusCode).toEqual(200);
    });

    it('should deny access if user is logged out', async () => {
      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/any-user')
        .send();

      expect(statusCode).toEqual(401);
    });
  });

  describe('superAdmin', () => {
    it('should allow access if user is logged in and is a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: true,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/super-admin')
        .send();

      expect(statusCode).toEqual(200);
    });

    it('should deny access if user is logged in but is not a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: false,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/super-admin')
        .send();

      expect(statusCode).toEqual(403);
    });

    it('should deny access if user is logged out', async () => {
      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/super-admin')
        .send();

      expect(statusCode).toEqual(401);
    });
  });

  describe('nonSuperAdmin', () => {
    it('should allow access if user is logged in and is not a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: false,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/non-super-admin')
        .send();

      expect(statusCode).toEqual(200);
    });

    it('should deny access if user is logged in but is a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: true,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/non-super-admin')
        .send();

      expect(statusCode).toEqual(403);
    });

    it('should deny access if user is logged out', async () => {
      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/non-super-admin')
        .send();

      expect(statusCode).toEqual(401);
    });
  });
});
