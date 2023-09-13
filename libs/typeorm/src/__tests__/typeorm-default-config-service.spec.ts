import { Test } from '@nestjs/testing';

import { StartedDb, startPostgres } from '@softkit/test-utils';
import { setupTypeormModule } from '../lib/setup-typeorm-module';
import { DbConfig } from '../lib/config/db';
import { Global, Module } from '@nestjs/common';

describe('typeorm default config', () => {
  let db: StartedDb;
  let dbConfig: DbConfig;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
      additionalTypeOrmModuleOptions: {
        migrations: ['app/migrations/*.ts'],
      },
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    @Global()
    @Module({
      providers: [
        {
          provide: DbConfig,
          useValue: {
            ...new DbConfig(),
            ...db.typeormOptions,
          },
        },
      ],
      exports: [DbConfig],
    })
    class GlobalConfigModule {}

    const module = await Test.createTestingModule({
      imports: [setupTypeormModule(__dirname), GlobalConfigModule],
    }).compile();

    dbConfig = module.get(DbConfig);
  });

  it('should have correct typeorm config', () => {
    expect(dbConfig).toBeDefined();
  });
});
