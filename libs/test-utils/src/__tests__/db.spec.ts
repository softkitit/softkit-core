import { startPostgres } from '../lib/start-postgres';
import { StartedDb } from '../lib/vo';

describe('start db and populate the entity', () => {
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres();
  });

  afterAll(async () => {
    await db.container.stop();
  });

  test('check that started db is working', () => {
    expect(db.typeormOptions).toBeDefined();
    expect(db.typeormOptions.database).toBeDefined();
    expect(db.container).toBeDefined();
    expect(db.TypeOrmConfigService).toBeDefined();
  });
});
