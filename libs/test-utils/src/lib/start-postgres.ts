import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { buildTypeormConfigService } from './typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getTransactionalContext } from 'typeorm-transactional/dist/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { StartDbOptions, StartedDb } from './vo';
import { DEFAULT_START_POSTGRES_OPTIONS } from './vo/start-postgres-default-options';
import { setTestEnvironmentForTypeorm } from './env/set-test-environment-for-typeorm';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';

export async function startPostgres(
  opts?: Partial<StartDbOptions>,
): Promise<StartedDb> {
  const options = {
    ...DEFAULT_START_POSTGRES_OPTIONS,
    ...opts,
  };

  // eslint-disable-next-line no-console
  console.time(`start db`);

  const pg = await new PostgreSqlContainer('postgres')
    .withExposedPorts(5432)
    .withDatabase(options.dbName)
    .withUsername(options.username)
    .withPassword(options.password)
    .start();

  // eslint-disable-next-line no-console
  console.timeEnd(`start db`);

  const typeormOptions = {
    ...options.additionalTypeOrmModuleOptions,
    port: pg.getPort(),
    username: pg.getUsername(),
    password: pg.getPassword(),
    database: pg.getDatabase(),
    synchronize: !options.runMigrations,
    migrationsRun: options.runMigrations,
    dropSchema: true,
    type: 'postgres',
  } as TypeOrmModuleOptions & PostgresConnectionCredentialsOptions;

  if (options.setupTransactionsManagement && !getTransactionalContext()) {
    initializeTransactionalContext();
  }

  await setTestEnvironmentForTypeorm(typeormOptions);

  return {
    container: pg,
    typeormOptions,
    TypeOrmConfigService: buildTypeormConfigService(typeormOptions),
  };
}
