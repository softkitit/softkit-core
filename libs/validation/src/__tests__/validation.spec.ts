import { faker } from '@faker-js/faker';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { DEFAULT_SAMPLE_DTO, SampleDto } from './app/vo/sample.dto';
import { SampleModule } from './app/sample.module';
import { DEFAULT_SAMPLE_PRIMITIVES_DTO } from './app/vo/sample-primitives.dto';
import { DEFAULT_SAMPLE_QUERY_PARAM } from './app/vo/sample-query.dto';
import { plainToClass } from 'class-transformer';

const generateFileName = (count: number) => {
  const res: string[] = [];

  for (let i = 1; i <= count; i++) {
    res.push(`${faker.person.lastName()}.png`);
  }

  return res;
};

describe('validation e2e test', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SampleModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    useContainer(app.select(SampleModule), {
      fallbackOnErrors: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    await app.init();
  });

  describe('validation post', () => {
    it('dto validation success', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/sample',
        payload: DEFAULT_SAMPLE_DTO,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toStrictEqual(DEFAULT_SAMPLE_DTO);
    });

    it.each([
      { input: '  test   ', expected: 'test' },
      { input: 'test    ', expected: 'test' },
      { input: '   test', expected: 'test' },
      { input: '  test  ', expected: 'test' },
    ])('should trim spaces from %s', ({ input, expected }) => {
      const payload = { trimField: input };

      const transformedPayload = plainToClass(SampleDto, payload);

      expect(transformedPayload.trimField).toBe(expected);
    });

    it.each(['fal', 'truee', '1', '0'])(
      'boolean validation fail: %s',
      async (value) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            someCheckboxValue: value,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it.each(['httpt://google.com', 'ftpa://test.co', 'http://google'])(
      'url validation fail: %s',
      async (value) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            url: value,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    // eslint-disable-next-line unicorn/no-null
    it.each(['', null, undefined, ' ', '     '])(
      'required validation fail: %s',
      async (value) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            email: value,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it.each([
      {
        emailArray: [faker.internet.email(), faker.internet.email()],
        expectedStatus: 201,
      },

      {
        emailArray: [faker.internet.email(), 'invalidEmail'],
        expectedStatus: 400,
      },

      { emailArray: [], expectedStatus: 201 },
    ])(
      'should validate email array: %s',
      async ({ emailArray, expectedStatus }) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            emailArray,
          },
        });

        expect(response.statusCode).toBe(expectedStatus);
      },
    );

    it.each([
      {
        fileNameArray: generateFileName(2),
        expectedStatus: 201,
      },
      {
        fileNameArray: generateFileName(4),
        expectedStatus: 201,
      },
      {
        fileNameArray: generateFileName(5),
        expectedStatus: 400,
      },
      {
        fileNameArray: generateFileName(1),
        expectedStatus: 400,
      },
      {
        fileNameArray: [],
        expectedStatus: 400,
      },
    ])(
      'should validate file name array: %s',
      async ({ fileNameArray, expectedStatus }) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            fileNameArray,
          },
        });

        expect(response.statusCode).toBe(expectedStatus);
      },
    );

    it.each([
      {
        documentArray: generateFileName(2),
        expectedStatus: 201,
      },
    ])(
      'should validate file name array: %s',
      async ({ documentArray, expectedStatus }) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            documentArray,
          },
        });

        expect(response.statusCode).toBe(expectedStatus);
      },
    );

    it.each(['invalidEmail', 'invalidEmail@', 'invalidEmail@.com'])(
      'email validation fail: %s',
      async (email) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            email,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it.each([faker.string.alphanumeric(5)])(
      'min length tests: %s',
      async (lastName) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            lastName,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it.each([faker.string.alphanumeric(101)])(
      'max length tests: %s',
      async (value) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            middleName: value,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it.each(['12345', '12345Aa', '1234567!', 'abcdefg!'])(
      'password validation fail: %s',
      async (password) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            password,
            repeatedPassword: password,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it('different passwords test', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/sample',
        payload: {
          ...DEFAULT_SAMPLE_DTO,
          repeatedPassword: DEFAULT_SAMPLE_DTO.repeatedPassword + '1',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('nested validation', () => {
    it.each([
      {
        nestedConfig: { certificate: 'valid-certificate' },
        expectedStatus: 201,
      },
      {
        nestedConfig: { certificate: '' },
        expectedStatus: 400,
      },
      {
        nestedConfig: undefined,
        expectedStatus: 400,
      },
      {
        nestedConfig: [],
        expectedStatus: 400,
      },
      {
        nestedConfig: 'not-an-object',
        expectedStatus: 400,
      },
    ])(
      'should validate nested config: %s',
      async ({ nestedConfig, expectedStatus }) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            nestedConfig,
          },
        });

        expect(response.statusCode).toBe(expectedStatus);
      },
    );

    it.each([
      {
        nestedConfigNotRequired: { certificate: 'valid-certificate' },
        expectedStatus: 201,
      },
      {
        nestedConfigNotRequired: { certificate: '' },
        expectedStatus: 400,
      },
      {
        nestedConfigNotRequired: undefined,
        expectedStatus: 201,
      },
      {
        nestedConfigNotRequired: [],
        expectedStatus: 201,
      },
      {
        nestedConfigNotRequired: 'not-an-object',
        expectedStatus: 400,
      },
    ])(
      'should validate nested config that not required: %s',
      async ({ nestedConfigNotRequired, expectedStatus }) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...DEFAULT_SAMPLE_DTO,
            nestedConfigNotRequired,
          },
        });

        expect(response.statusCode).toBe(expectedStatus);
      },
    );
  });

  describe('validation primitives', () => {
    it('dto validation success', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/sample/primitives',
        payload: DEFAULT_SAMPLE_PRIMITIVES_DTO,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toStrictEqual(
        DEFAULT_SAMPLE_PRIMITIVES_DTO,
      );
    });

    it.each([
      ['number', ['abs', '12,3,3,3,3', '', ' ', '     ']],
      ['arr', [{}, 'asd', 123, true]],
      ['object', [123, true, 'asd', []]],
      ['json', [123, true, 'asd', '{{}}']],
      ['date', [123, true, 'asd', '', ' ', '     ', '2020-40-40']],
      ['integer', [true, 'asd', '', ' ', '     ', '2020-40-40', {}, []]],
      [
        'onlyLowercaseCharacters',
        ['asd123', 'ASD', 'ASD123', 'ASD123asd', 'ASD123asd', 'ASD123'],
      ],
      ['minTen', [9, 9.9, 9.999_999_999_999_99]],
      ['maxTen', [11, 10.1, 10.000_000_000_000_01]],
      ['arrayMinThree', [['asd1', 'asd2']]],
      ['arrayMaxThree', [['asd23', 'asd123', 'asd4234', 'asd4324']]],
    ])(
      'failed validation: field - %s, values: %s',
      async (fieldName: string, values: unknown[]) => {
        for (const value of values) {
          const response = await app.inject({
            method: 'POST',
            url: '/sample/primitives',
            payload: {
              ...DEFAULT_SAMPLE_PRIMITIVES_DTO,
              [fieldName]: value,
            },
          });

          expect(response.statusCode).toBe(400);
        }
      },
    );
  });

  describe('validation query', () => {
    it.each([
      '1',
      '0',
      // -0 will be 0 as a result of conversion
      '-0',
      '2',
      '10',
      '-100',
      '-2000',
      '100',
      '1000',
      Number.MAX_SAFE_INTEGER + '',
    ])('query validation failed for page: %s', async (page) => {
      const response = await app.inject({
        method: 'GET',
        url: '/sample',
        query: {
          ...DEFAULT_SAMPLE_QUERY_PARAM,
          page,
        },
      });

      const responseBody = JSON.parse(response.body);

      expect(responseBody).toStrictEqual({
        ...DEFAULT_SAMPLE_QUERY_PARAM,
        page: page === '-0' ? 0 : Number.parseInt(page, 10),
        bool: true,
        size: Number.parseInt(DEFAULT_SAMPLE_QUERY_PARAM.size),
      });
      expect(response.statusCode).toBe(200);
    });

    it.each([
      Number.MAX_VALUE + '',
      '1.1',
      '1,1',
      '1,0',
      '1.10',
      '1,020',
      '1.0002',
      '-1.0',
      '1.0',
      '000201',
      '0x000201',
      '0x000201',
      '1.0e3',
      '0b11111111',
      '0xff',
      '0b11111111',
    ])('failed page number: %s', async (page: string) => {
      const response = await app.inject({
        method: 'GET',
        url: '/sample',
        query: {
          ...DEFAULT_SAMPLE_QUERY_PARAM,
          page,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it.each([
      '',
      ' ',
      '     ',
      'not-a-uuid',
      '123e4567-e89b-12d3-a456-426655440000', // Version 3 UUID
      'f47ac10b-58cc-1001-a567-0e02b2c3d479', // Version 1 UUID
      '987d1231-e1bd-5c5e-81b4-05b762f5ae69', // Version 5 UUID
      '7a09a56a-9b81-4a0a-ae75-57a5609799c8-invalid', // Extra characters at the end
      '7a09a56a-9b81-4a0a-ae75-57a5609799c', // Incomplete UUID
    ])(`uuid validation fail: %s`, async (uuid) => {
      const response = await app.inject({
        method: 'GET',
        url: '/sample',
        query: {
          ...DEFAULT_SAMPLE_QUERY_PARAM,
          uuid,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('validation sort params', () => {
    it.each([
      [['A', 'C'], ['A', 'D'], undefined],
      [['A', 'D'], undefined, undefined],
      [['A', 'D'], ['A', 'D'], undefined],
      [
        ['B', 'D'],
        ['A', 'D'],
        ['A', 'C'],
      ],
      [['B', 'C'], ['A', 'D'], undefined],
    ])(
      'should pass sort params validation: %s & %s & %s',
      async (firstPair, secondPair, thirdPair) => {
        const pairsWithValues = [firstPair, secondPair, thirdPair].filter(
          (pair): pair is string[] => !!pair,
        );

        const response = await app.inject({
          method: 'GET',
          url: '/sample/sort',
          query: {
            sortParams: pairsWithValues
              .map((pair) => pair?.join(':'))
              .join(','),
          },
        });

        expect(response.statusCode).toBe(200);

        const sortParams = pairsWithValues.map((pair) => {
          return {
            direction: pair[0],
            sortValue: pair[1],
          };
        });

        expect(JSON.parse(response.body)).toStrictEqual({ sortParams });
      },
    );

    it.each([
      [
        // correct values, bad separator item separator
        [['A', 'C']],
        ';',
        ',',
      ],
      [
        // correct values, bad separator items separator
        [
          ['A', 'C'],
          ['B', 'D'],
        ],
        ';',
        ',',
      ],
      [
        // more params that we can parse
        [['A', 'C', 'D']],
        ':',
        ',',
      ],
      [
        // less params that needed
        [['A']],
        ':',
        ',',
      ],
    ])(
      'should not pass params validation: %s, item separator: %s, items separator: %s',
      async (sortParams, itemSeparator, itemsSeparator) => {
        const response = await app.inject({
          method: 'GET',
          url: '/sample/sort',
          query: {
            sortParams: sortParams
              .map((a) => a.join(itemSeparator))
              .join(itemsSeparator),
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it('should throw bad request without any query params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sample/sort',
        query: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
