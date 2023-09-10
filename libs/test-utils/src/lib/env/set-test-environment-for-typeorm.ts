import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export async function setTestEnvironmentForTypeorm(
  typeormOptions: PostgresConnectionCredentialsOptions & TypeOrmModuleOptions,
) {
  const password =
    typeormOptions.password === undefined ||
    typeof typeormOptions.password === 'string'
      ? typeormOptions.password
      : await typeormOptions.password();

  process.env['TEST_DB_PORT'] = typeormOptions.port + '';
  process.env['TEST_DB_USERNAME'] = typeormOptions.username;

  if (password !== undefined) {
    process.env['TEST_DB_PASSWORD'] = password + '';
  }
  process.env['TEST_DB_DATABASE'] = typeormOptions.database;
  process.env['TEST_DB_SYNCHRONIZE'] = typeormOptions.synchronize + '';
  process.env['TEST_DB_DROP_SCHEMA'] = typeormOptions.dropSchema + '';
  process.env['TEST_DB_RUN_MIGRATIONS'] = typeormOptions.migrationsRun + '';
}
