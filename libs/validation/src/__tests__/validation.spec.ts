import { faker } from '@faker-js/faker';
import {
  Body,
  Controller,
  Get,
  Module,
  Optional,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateNested, useContainer } from 'class-validator';

import {
  IsBooleanLocalized,
  IsEmailLocalized,
  IsIntegerStringLocalized,
  IsRequiredStringLocalized,
  IsStringEnumLocalized,
  IsUrlLocalized,
  IsUUIDLocalized,
  MatchesWithProperty,
  PasswordLocalized,
  toObjectsArrayFromString,
} from '../index';
import { Transform, Type } from 'class-transformer';

describe('validation e2e test', () => {
  let app: NestFastifyApplication;
  let validDto: SampleDto;

  beforeAll(async () => {
    validDto = {
      email: faker.internet.email().toLowerCase(),
      password: '12345Aa!',
      repeatedPassword: '12345Aa!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName() + faker.string.alphanumeric(10),
      middleName: faker.person.middleName(),
      someCheckboxValue: faker.datatype.boolean(),
      url: faker.internet.url(),
    };

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

  describe('validation post tests', () => {
    it('dto validation success', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/sample',
        payload: validDto,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toStrictEqual(validDto);
    });

    it.each(['fal', 'truee', '1', '0'])(
      'boolean validation fail: %s',
      async (value) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...validDto,
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
            ...validDto,
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
            ...validDto,
            email: value,
          },
        });

        expect(response.statusCode).toBe(400);
      },
    );

    it.each(['invalidEmail', 'invalidEmail@', 'invalidEmail@.com'])(
      'email validation fail: %s',
      async (email) => {
        const response = await app.inject({
          method: 'POST',
          url: '/sample',
          payload: {
            ...validDto,
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
            ...validDto,
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
            ...validDto,
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
            ...validDto,
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
          ...validDto,
          repeatedPassword: validDto.repeatedPassword + '1',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('validation query tests', () => {
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
    ])('query validation success: %s', async (page) => {
      const query = {
        page: page,
        uuid: faker.string.uuid(),
      };
      const response = await app.inject({
        method: 'GET',
        url: '/sample',
        query: query,
      });

      const responseBody = JSON.parse(response.body);

      expect(responseBody).toStrictEqual({
        uuid: query.uuid,
        // there is a bit strange behavior in nestjs or fastify serialization
        // -0 will be 0 as a result of conversion, and in most cases it is ok and has nothing to do with validation
        page: query.page === '-0' ? 0 : Number.parseInt(query.page, 10),
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
          uuid: faker.string.uuid(),
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
          uuid,
          page: faker.number.int(100).toString(10),
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('validation sort params tests', () => {
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
      'sort params validation success: %s & %s & %s',
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
      'sort params validation fail: %s, item separator: %s, items separator: %s',
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
  });
});

class SortParams {
  @IsStringEnumLocalized(['A', 'B'])
  direction!: string;

  @IsStringEnumLocalized(['C', 'D'])
  sortValue!: string;
}

class SampleSort {
  @ValidateNested({
    each: true,
    always: true,
  })
  @Type(() => SortParams)
  @Transform((value) => {
    return toObjectsArrayFromString<SortParams>(
      value,
      ['direction', 'sortValue'],
      SortParams,
    );
  })
  sortParams!: SortParams[];
}

class SampleQueryParam {
  @IsIntegerStringLocalized({
    required: true,
  })
  page!: number;

  @IsUUIDLocalized()
  uuid!: string;
}

class SampleDto {
  @IsEmailLocalized()
  email!: string;

  @IsRequiredStringLocalized()
  @PasswordLocalized()
  password!: string;

  @PasswordLocalized()
  @MatchesWithProperty(SampleDto, (s) => s.password, {
    message: 'validation.REPEAT_PASSWORD_DOESNT_MATCH',
  })
  @IsRequiredStringLocalized()
  repeatedPassword!: string;

  @IsRequiredStringLocalized()
  firstName!: string;

  @IsRequiredStringLocalized({
    minLength: 10,
  })
  lastName!: string;

  @IsRequiredStringLocalized({
    minLength: 0,
    maxLength: 100,
  })
  middleName!: string;

  @IsBooleanLocalized()
  someCheckboxValue!: boolean;

  @IsUrlLocalized()
  url!: string;

  @Optional()
  optionalField?: string;
}

@Controller('/sample')
class SampleController {
  @Post()
  async create(@Body() dto: SampleDto) {
    return dto;
  }

  @Get()
  async get(@Query() dto: SampleQueryParam) {
    return dto;
  }

  @Get('sort')
  async getSort(@Query() dto: SampleSort) {
    return dto;
  }
}

@Module({
  controllers: [SampleController],
})
class SampleModule {}
