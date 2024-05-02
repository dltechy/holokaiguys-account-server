import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpMethod } from '@app/constants/http-request.constants';
import { AuthGuard } from '@app/guards/auth.guard';
import { getConfigImport } from '@app/helpers/__tests__/imports/config-imports.helper';
import { createBodyValidationTests } from '@app/helpers/__tests__/validation/body-validation.helper';
import { createParamsValidationTests } from '@app/helpers/__tests__/validation/params-validation.helper';
import { createQueryValidationTests } from '@app/helpers/__tests__/validation/query-validation.helper';
import { initializeGlobalPipes } from '@app/helpers/initialization/global-pipes-initialization.helper';
import { initializeValidators } from '@app/helpers/initialization/validators-initialization.helper';
import { ValidateMaxQueryCount } from '@app/helpers/validators/validate-max-query-count.helper';
import { authGuardMock } from '@app/modules/auth/__tests__/mocks/auth.mocks';
import { UsersController } from '@app/modules/users/users.controller';
import { UsersService } from '@app/modules/users/users.service';

import { usersServiceMock } from './mocks/users.mocks';

describe('UsersController (validation)', () => {
  // Properties & methods

  let app: INestApplication;

  const initializeModule = async (): Promise<TestingModule> => {
    const module = await Test.createTestingModule({
      imports: [getConfigImport()],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        ValidateMaxQueryCount,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();

    initializeValidators(module);

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

    authGuardMock.canActivate.mockResolvedValue(true);
  });

  // Tests

  describe('getMany', () => {
    createQueryValidationTests({
      appGetter: () => app,
      httpMethod: HttpMethod.Get,
      path: '/users',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'isSuperAdmin',
          successValues: ['true', 'false'],
          failValues: ['True', 'False', 'string', ''],
        },
        {
          property: 'discordUsername',
          successValues: ['string', ''],
          failValues: [],
        },
        {
          property: 'discordDisplayName',
          successValues: ['string', ''],
          failValues: [],
        },
        {
          property: 'page',
          successValues: ['1', '10'],
          failValues: ['0', '-1', 'string', ''],
        },
        {
          property: 'count',
          successValues: ['1', process.env.QUERY_MAX_RESPONSE_COUNT],
          failValues: [
            '0',
            '-1',
            `${parseInt(process.env.QUERY_MAX_RESPONSE_COUNT, 10) + 1}`,
            'string',
            '',
          ],
        },
        {
          property: 'sortBy',
          successValues: [
            'isSuperAdmin',
            'discordUsername',
            'discordDisplayName',
            'createdAt',
            'updatedAt',
          ],
          failValues: ['string', ''],
        },
        {
          property: 'sortOrder',
          successValues: ['ASC', 'DESC'],
          failValues: ['asc', 'desc', 'string', ''],
        },
      ],
    });
  });

  describe('getById', () => {
    const requiredParams = {
      id: '00000000-0000-4000-8000-000000000000',
    };

    createParamsValidationTests({
      appGetter: () => app,
      requiredParams,
      httpMethod: HttpMethod.Get,
      path: '/users/:id',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'id',
          successValues: [
            '00000000-0000-4000-8000-000000000000',
            '01234567-89AB-4CDE-9F01-23456789ABCD',
            '01234567-8901-4234-A567-890123456789',
            'ABCDEFAB-CDEF-4ABC-BDEF-ABCDEFABCDEF',
            '01234567-89ab-4cde-af01-23456789abcd',
            'abcdefab-cdef-4abc-bdef-abcdefabcdef',
          ],
          failValues: [
            '00000000-0000-0000-0000-000000000000',
            '0123456789ABCDEF0123456789ABCDEF',
            '01234567-89AB-CDEF-0123',
            'string',
          ],
        },
      ],
    });
  });

  describe('getByDiscordId', () => {
    const requiredParams = {
      discordId: 'string',
    };

    createParamsValidationTests({
      appGetter: () => app,
      requiredParams,
      httpMethod: HttpMethod.Get,
      path: '/users/discord/ids/:discordId',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'discordId',
          successValues: ['string'],
          failValues: [],
        },
      ],
    });
  });

  describe('getByDiscordUsername', () => {
    const requiredParams = {
      discordUsername: 'string',
    };

    createParamsValidationTests({
      appGetter: () => app,
      requiredParams,
      httpMethod: HttpMethod.Get,
      path: '/users/discord/usernames/:discordUsername',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'discordUsername',
          successValues: ['string'],
          failValues: [],
        },
      ],
    });
  });

  describe('updateSuperAdminState', () => {
    const requiredParams = {
      id: '00000000-0000-4000-8000-000000000000',
    };

    const requiredBody = {
      isSuperAdmin: true,
    };

    createParamsValidationTests({
      appGetter: () => app,
      requiredParams,
      requiredBody,
      httpMethod: HttpMethod.Patch,
      path: '/users/:id/super-admin-state',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'id',
          successValues: [
            '00000000-0000-4000-8000-000000000000',
            '01234567-89AB-4CDE-9F01-23456789ABCD',
            '01234567-8901-4234-A567-890123456789',
            'ABCDEFAB-CDEF-4ABC-BDEF-ABCDEFABCDEF',
            '01234567-89ab-4cde-af01-23456789abcd',
            'abcdefab-cdef-4abc-bdef-abcdefabcdef',
          ],
          failValues: [
            '00000000-0000-0000-0000-000000000000',
            '0123456789ABCDEF0123456789ABCDEF',
            '01234567-89AB-CDEF-0123',
            'string',
          ],
        },
      ],
    });

    createBodyValidationTests({
      appGetter: () => app,
      httpMethod: HttpMethod.Patch,
      path: '/users/00000000-0000-4000-8000-000000000000/super-admin-state',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'isSuperAdmin',
          successValues: [true, false],
          failValues: ['true', 'false', ''],
        },
      ],
    });
  });

  describe('delete', () => {
    const requiredParams = {
      id: '00000000-0000-4000-8000-000000000000',
    };

    createParamsValidationTests({
      appGetter: () => app,
      requiredParams,
      httpMethod: HttpMethod.Delete,
      path: '/users/:id',
      expectedSuccessStatusCode: 200,
      propertyTestValues: [
        {
          property: 'id',
          successValues: [
            '00000000-0000-4000-8000-000000000000',
            '01234567-89AB-4CDE-9F01-23456789ABCD',
            '01234567-8901-4234-A567-890123456789',
            'ABCDEFAB-CDEF-4ABC-BDEF-ABCDEFABCDEF',
            '01234567-89ab-4cde-af01-23456789abcd',
            'abcdefab-cdef-4abc-bdef-abcdefabcdef',
          ],
          failValues: [
            '00000000-0000-0000-0000-000000000000',
            '0123456789ABCDEF0123456789ABCDEF',
            '01234567-89AB-CDEF-0123',
            'string',
          ],
        },
      ],
    });
  });
});
