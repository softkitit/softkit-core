import { StartDbOptions } from './start-db-options';

export const DEFAULT_START_POSTGRES_OPTIONS: StartDbOptions = {
  runMigrations: false,
  dbName: 'nest',
  password: 'secret-test',
  username: 'test-user',
  setupTransactionsManagement: true,
  additionalTypeOrmModuleOptions: {},
};
