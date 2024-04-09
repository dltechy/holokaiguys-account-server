import { INestApplication } from '@nestjs/common';
import * as _ from 'lodash';
import * as qs from 'qs';
import * as request from 'supertest';

import { HttpMethod } from '@app/constants/http-request.constants';

export function createQueryValidationTests({
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
    property: string;
    successValues: (string | string[])[];
    failValues: (string | string[])[];
  }[];
}): void {
  const runTest = async ({
    query,
    exptectedStatusCode,
  }: {
    query: { [key: string]: string | string[] };
    exptectedStatusCode: number;
  }): Promise<void> => {
    if (beforeEach) {
      await beforeEach();
    }

    const { statusCode } = await request(appGetter().getHttpServer())
      [httpMethod](path)
      .set('Cookie', cookies)
      .query(qs.stringify(query))
      .send(requiredBody);

    expect(statusCode).toEqual(exptectedStatusCode);

    if (afterEach) {
      await afterEach();
    }
  };

  describe('req.query', () => {
    if (Object.keys(requiredQuery).length > 0) {
      it('should pass with required values', async () => {
        await runTest({
          query: requiredQuery,
          exptectedStatusCode: expectedSuccessStatusCode,
        });
      });

      Object.keys(requiredQuery).forEach((key) => {
        it(`should fail if missing "${key}" field`, async () => {
          const query = _.cloneDeep(requiredQuery);
          delete query[key];

          await runTest({
            query,
            exptectedStatusCode: expectedFailStatusCode,
          });
        });
      });
    }

    propertyTestValues.forEach(({ property, successValues, failValues }) => {
      describe(property, () => {
        successValues.forEach((value) => {
          it(`should accept "${value}"`, async () => {
            const query = _.cloneDeep(requiredQuery);
            _.set(query, property, value);

            await runTest({
              query,
              exptectedStatusCode: expectedSuccessStatusCode,
            });
          });
        });

        failValues.forEach((value) => {
          it(`should reject "${value}"`, async () => {
            const query = _.cloneDeep(requiredQuery);
            _.set(query, property, value);

            await runTest({
              query,
              exptectedStatusCode: expectedFailStatusCode,
            });
          });
        });
      });
    });
  });
}
