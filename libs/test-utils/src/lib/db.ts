import { PostgreSqlContainer } from 'testcontainers';

export async function startDb(
  migrationsRun = false,
  dbName = 'nest',
  password = 'secret-test',
  username = 'test-user'
) {
  // eslint-disable-next-line no-console
  console.time(`start db`);

  const pg = await new PostgreSqlContainer('postgres')
    .withExposedPorts(5432)
    .withDatabase(dbName)
    .withUsername(username)
    .withPassword(password)
    .start();

  // eslint-disable-next-line no-console
  console.timeEnd(`start db`);

  return {
    container: pg,
    typeormOptions: {
      synchronize: !migrationsRun,
      migrationsRun,
      dropSchema: true,
      port: pg.getPort(),
      username: pg.getUsername(),
      password: pg.getPassword(),
      database: pg.getDatabase(),
      type: 'postgres',
    },
  };
}
