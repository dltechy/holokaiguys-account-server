import { Controller, Get, INestApplication, mixin, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { UseAuthGuard } from '@app/guards/auth.guard';
import { LoginHelperModule } from '@app/helpers/__tests__/guards/login-helper.module';
import { LoginHelperService } from '@app/helpers/__tests__/guards/login-helper.service';
import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { getSessionImports } from '@app/helpers/__tests__/imports/session-imports.helper';
import { initializeSession } from '@app/helpers/initialization/session-initialization.helper';
import { usersDaoMock } from '@app/modules/users/__tests__/mocks/users.mocks';
import { usersSamples } from '@app/modules/users/__tests__/samples/users.samples';

describe('AuthGuard', () => {
  // Properties & methods

  let app: INestApplication;

  let loginHelperService: LoginHelperService;

  const createTestController = (): Type<unknown> => {
    @Controller('test')
    class TestController {
      @UseAuthGuard()
      @Get('any-user')
      public anyUser(): void {
        // Do nothing
      }

      @UseAuthGuard({
        isSuperAdmin: true,
      })
      @Get('super-admin')
      public superAdmin(): void {
        // Do nothing
      }

      @UseAuthGuard({
        isSuperAdmin: false,
      })
      @Get('non-super-admin')
      public nonSuperAdmin(): void {
        // Do nothing
      }
    }

    return mixin(TestController);
  };

  const initializeModule = async (
    controller: Type<unknown>,
  ): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport(), ...getSessionImports(), LoginHelperModule],
      controllers: [controller],
    }).compile();

    loginHelperService = module.get(LoginHelperService);

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
    const module = await initializeModule(createTestController());
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

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/any-user')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(200);
    });

    it('should deny access if user is logged out', async () => {
      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer()).get(
        '/test/any-user',
      );

      expect(statusCode).toEqual(401);
    });

    it('should deny access if user is logged in but has been deleted', async () => {
      usersDaoMock.getById.mockResolvedValue(usersSamples[0].user);

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/any-user')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(401);
    });
  });

  describe('superAdmin', () => {
    it('should allow access if user is logged in and is a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: true,
      });

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/super-admin')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(200);
    });

    it('should deny access if user is logged in but is not a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: false,
      });

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/super-admin')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(403);
    });

    it('should deny access if user is logged out', async () => {
      const { statusCode } = await request(app.getHttpServer()).get(
        '/test/super-admin',
      );

      expect(statusCode).toEqual(401);
    });

    it('should deny access if user is logged in and is a super admin but has been deleted', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: true,
      });

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/super-admin')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(401);
    });
  });

  describe('nonSuperAdmin', () => {
    it('should allow access if user is logged in and is not a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: false,
      });

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/non-super-admin')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(200);
    });

    it('should deny access if user is logged in but is a super admin', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: true,
      });

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/non-super-admin')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(403);
    });

    it('should deny access if user is logged out', async () => {
      const { statusCode } = await request(app.getHttpServer()).get(
        '/test/non-super-admin',
      );

      expect(statusCode).toEqual(401);
    });

    it('should deny access if user is logged in and is not a super admin but has been deleted', async () => {
      usersDaoMock.getById.mockResolvedValue({
        ...usersSamples[0].user,
        isSuperAdmin: false,
      });

      const { loginHeader } = await loginHelperService.login({
        appGetter: () => app,
      });

      usersDaoMock.getById.mockResolvedValue(null);

      const { statusCode } = await request(app.getHttpServer())
        .get('/test/non-super-admin')
        .set('Cookie', [...loginHeader['set-cookie']]);

      expect(statusCode).toEqual(401);
    });
  });
});
