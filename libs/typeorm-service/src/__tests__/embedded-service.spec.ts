import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { setupTypeormModule } from '@softkit/typeorm';
import { EmbeddedService } from './app/service/embedded.service';
import { EntityWithEmbeddedId } from './app/entity/entity-with-embedded-id';
import { EmbeddedRepository } from './app/repository/embedded.repository';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { EmbeddedId } from './app/entity/vo/embedded-id';

function generateRandomEntityToSave() {
  return {
    id: plainToInstance(EmbeddedId, {
      name: faker.string.uuid(),
      version: faker.number.int(100),
    }),
    someColumn: faker.string.uuid(),
  };
}

describe('embedded service tests', () => {
  let embeddedService: EmbeddedService;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: false,
      additionalTypeOrmModuleOptions: {
        entities: [EntityWithEmbeddedId],
        namingStrategy: new SnakeNamingStrategy(),
      },
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([EntityWithEmbeddedId]),
        setupTypeormModule({
          optionsFactory: db.TypeOrmConfigService,
        }),
        ClsModule.forRoot({
          global: true,
        }),
      ],
      providers: [EmbeddedRepository, EmbeddedService],
    }).compile();

    embeddedService = module.get<EmbeddedService>(EmbeddedService);
  });

  test('should fail on second creation of the same entity', async () => {
    const toSave = generateRandomEntityToSave();
    const savedEntity = await embeddedService.createOrUpdateEntity(toSave);

    expect(savedEntity.createdAt.getTime()).toBeLessThan(Date.now());
    expect(savedEntity.updatedAt.getTime()).toBeLessThan(Date.now());
    expect(savedEntity.deletedAt).toBeNull();

    const { createdAt, updatedAt, deletedAt, ...other } = savedEntity;

    expect(toSave).toStrictEqual(other);

    // second save should overwrite the entity

    await embeddedService.createOrUpdateEntity(toSave);

    const entityWithEmbeddedIds = await embeddedService.findAll();

    expect(entityWithEmbeddedIds.length === 1).toBeTruthy();
  });
});
