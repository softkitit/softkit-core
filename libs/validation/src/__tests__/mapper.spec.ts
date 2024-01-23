import { TransformSimpleEntity } from './app/vo/transform/transform-simple.entity';
import { WithPasswordFieldEntity } from './app/vo/transform/with-password-field.entity';
import { TransformWithChildEntity } from './app/vo/transform/transform-with-child.entity';
import { TransformWithChildArrayEntity } from './app/vo/transform/transform-with-child-array.entity';
import { map } from '../lib/mapping';
import { BASE_TRANSFORM_ENTITY } from './app/vo/transform/base-transform.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { SampleModule } from './app/sample.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('map unit tests', () => {
  it('should map base entity to simple with 2 fields', () => {
    const mapSimpleEntity = map(BASE_TRANSFORM_ENTITY, TransformSimpleEntity);
    expect(Object.keys(mapSimpleEntity).length).toBe(2);

    expect(mapSimpleEntity.id).toBe(BASE_TRANSFORM_ENTITY.id);
    expect(mapSimpleEntity.name).toBe(BASE_TRANSFORM_ENTITY.name);
  });

  it('should map base entity to one with a password', () => {
    const entityWithPassword = map(
      BASE_TRANSFORM_ENTITY,
      WithPasswordFieldEntity,
      {
        ignoreDecorators: true,
      },
    );
    expect(Object.keys(entityWithPassword).length).toBe(1);

    expect(entityWithPassword.password).toBe(BASE_TRANSFORM_ENTITY.password);
  });

  it('should map base entity to one with a password with exclusions', () => {
    const entityWithPassword = map(
      BASE_TRANSFORM_ENTITY,
      WithPasswordFieldEntity,
      {
        ignoreDecorators: false,
      },
    );
    expect(Object.keys(entityWithPassword).length).toBe(0);
  });

  it('should map base entity to one custom child', () => {
    const mapped = map(BASE_TRANSFORM_ENTITY, TransformWithChildEntity);
    expect(Object.keys(mapped).length).toBe(3);

    expect(mapped.id).toBe(BASE_TRANSFORM_ENTITY.id);
    expect(mapped.name).toBe(BASE_TRANSFORM_ENTITY.name);
    expect(mapped.child).toBeDefined();

    expect(Object.keys(mapped.child).length).toBe(1);

    expect(mapped.child.id).toBe(BASE_TRANSFORM_ENTITY?.child?.id);
  });

  it('should map base entity to custom children array', () => {
    const mapped = map(BASE_TRANSFORM_ENTITY, TransformWithChildArrayEntity);
    expect(Object.keys(mapped).length).toBe(3);

    expect(mapped.id).toBe(BASE_TRANSFORM_ENTITY.id);
    expect(mapped.name).toBe(BASE_TRANSFORM_ENTITY.name);
    expect(mapped.childArr).toBeDefined();
    expect(mapped.childArr.length).toBe(1);

    expect(Object.keys(mapped.childArr[0]).length).toBe(1);

    const childArrElement = (BASE_TRANSFORM_ENTITY.childArr || [])[0];
    expect(mapped.childArr[0].id).toBe(childArrElement?.id);
  });
});

describe('map integrations tests', () => {
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
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.init();
  });

  it('should map base entity to simple with 2 fields, with custom getter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/mapping/with-exclusion',
    });

    expect(response.statusCode).toBe(200);
    const responseBody = JSON.parse(response.body);

    expect(Object.keys(responseBody).length).toBe(2);

    expect(responseBody.id).toBe(BASE_TRANSFORM_ENTITY.id);
    expect(responseBody.customName).toBe(BASE_TRANSFORM_ENTITY.name);
  });
});
