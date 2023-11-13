import { startPostgres } from '../lib/start-postgres';
import { StartDbOptions, StartedDb } from '../lib/vo';

describe('start postgres db and create configs', () => {
  it.each([
    {},
    {
      additionalTypeOrmModuleOptions: {
        password: () => 'test',
      },
    },
  ])(
    'check that started db is working: %s',
    async (additionalOptions: Partial<StartDbOptions>) => {
      const db: StartedDb = await startPostgres(additionalOptions);

      try {
        expect(db.typeormOptions).toBeDefined();
        expect(db.typeormOptions.database).toBeDefined();
        expect(db.container).toBeDefined();
        expect(db.TypeOrmConfigService).toBeDefined();

        const typeOrmConfigService = new db.TypeOrmConfigService();

        expect(typeOrmConfigService).toBeDefined();
        const options = typeOrmConfigService.createTypeOrmOptions();
        expect(options).toBeDefined();

        expect(options).toMatchObject(db.typeormOptions);
      } finally {
        await db.container.stop();
      }
    },
    60_000,
  );
});
