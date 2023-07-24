import { faker } from '@faker-js/faker';
import { Body, Controller, Module, Optional, Post, ValidationPipe } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';

import {
  IsBooleanLocalized,
  IsEmailLocalized,
  IsRequiredStringLocalized,
  IsUrlLocalized,
  MatchesWithProperty,
  PasswordLocalized,
} from '../index';

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

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

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
    'boolean validation fail',
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
    'url validation fail',
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
    'required validation fail',
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
    'email validation fail',
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
    'min length tests',
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
    'max length tests',
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
    'password validation fail',
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
}

@Module({
  controllers: [SampleController],
})
class SampleModule {}
