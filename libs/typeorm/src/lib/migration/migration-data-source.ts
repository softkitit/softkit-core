import { fileLoader } from 'nest-typed-config';

import * as path from 'node:path';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DbConfig } from '../config/db';

const sourceDir = path.join(
  process.cwd(),
  // todo figure out how to improve it using nx
  `apps/${process.env['MIGRATION_APP_NAME']}/src`,
);

const appDir = path.join(sourceDir, 'app');

const { db } = fileLoader({
  absolutePath: path.join(appDir, 'assets/.env.yaml'),
  ignoreEnvironmentVariableSubstitution: false,
})() as { db: DbConfig };

// populate default values for missing properties from DbConfig file
const defaultConfig = new DbConfig();

export const AppDataSource = new DataSource({
  ...defaultConfig,
  ...(db as DbConfig),
  entities: [path.join(appDir, 'database/entities/**/*{.ts,.js}')],
  migrations: [path.join(appDir, 'database/migrations/**/*{.ts,.js}')],
} as DataSourceOptions);
