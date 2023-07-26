import { StartedPostgreSqlContainer } from 'testcontainers';
import { startDb } from '../lib/db';

describe('start db and populate the entity', () => {
  let connection: { container: StartedPostgreSqlContainer };

  beforeAll(async () => {
    connection = await startDb();
  });

  test('check that started db is working', () => {
    const container = connection.container;
    expect(container.getDatabase()).toBeDefined();
    expect(container.getUsername()).toBeDefined();
    expect(container.getPassword()).toBeDefined();
    expect(container.getPort()).toBeDefined();
  });
});
