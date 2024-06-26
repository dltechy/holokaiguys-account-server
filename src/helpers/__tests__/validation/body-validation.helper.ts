import { INestApplication } from '@nestjs/common';
import * as _ from 'lodash';
import * as qs from 'qs';
import * as request from 'supertest';

import { HttpMethod } from '@app/constants/http-request.constants';

export function createBodyValidationTests({
  appGetter,
  beforeEach,
  afterEach,
  requiredQuery = {},
  requiredBody = {},
  httpMethod,
  path,
  cookies = [],
  expectedSuccessStatusCode,
  expectedFailStatusCode = 400,
  propertyTestValues,
}: {
  appGetter: () => INestApplication;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  requiredQuery?: { [key: string]: string | string[] };
  requiredBody?: {};
  httpMethod: HttpMethod;
  path: string;
  cookies?: string[];
  expectedSuccessStatusCode: number;
  expectedFailStatusCode?: number;
  propertyTestValues: {
    bodyOverride?: {};
    property: string;
    successValues: unknown[];
    failValues: unknown[];
  }[];
}): void {
  const runTest = async ({
    body,
    exptectedStatusCode,
  }: {
    body: {};
    exptectedStatusCode: number;
  }): Promise<void> => {
    if (beforeEach) {
      await beforeEach();
    }

    const { statusCode } = await request(appGetter().getHttpServer())
      [httpMethod](path)
      .set('Cookie', cookies)
      .query(qs.stringify(requiredQuery))
      .send(body);

    expect(statusCode).toEqual(exptectedStatusCode);

    if (afterEach) {
      await afterEach();
    }
  };

  describe('req.body', () => {
    if (Object.keys(requiredBody).length > 0) {
      it('should pass with required values', async () => {
        await runTest({
          body: requiredBody,
          exptectedStatusCode: expectedSuccessStatusCode,
        });
      });

      Object.keys(requiredBody).forEach((key) => {
        it(`should fail if missing "${key}" field`, async () => {
          const body = _.cloneDeep(requiredBody);
          delete body[key];

          await runTest({
            body,
            exptectedStatusCode: expectedFailStatusCode,
          });
        });
      });
    }

    propertyTestValues.forEach(
      ({ bodyOverride, property, successValues, failValues }) => {
        describe(property, () => {
          successValues.forEach((value) => {
            it(`should accept "${value}"`, async () => {
              const body = _.cloneDeep(bodyOverride ?? requiredBody);
              _.set(body, property, value);

              await runTest({
                body,
                exptectedStatusCode: expectedSuccessStatusCode,
              });
            });
          });

          failValues.forEach((value) => {
            it(`should reject "${value}"`, async () => {
              const body = _.cloneDeep(bodyOverride ?? requiredBody);
              _.set(body, property, value);

              await runTest({
                body,
                exptectedStatusCode: expectedFailStatusCode,
              });
            });
          });
        });
      },
    );
  });
}
