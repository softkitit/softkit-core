import { fileLoader } from 'nest-typed-config';

import * as path from 'node:path';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DbConfig } from "../config/db";

const sourceDir = path.join(
  process.cwd(),
  // todo figure out how to improve it using nx
  `apps/${process.env['MIGRATION_APP_NAME']}/src`,
);
const { db } = fileLoader({
  absolutePath: path.join(sourceDir, '.env.yaml'),
  ignoreEnvironmentVariableSubstitution: false,
})() as { db: DbConfig };

db.entities = db.entities.map((e) => `${sourceDir}/${e}`);
db.migrations = db.migrations.map((e) => `${sourceDir}/${e}`);

// populate default values for missing properties from DbConfig file
const defaultConfig = new DbConfig();

export const AppDataSource = new DataSource({
  ...defaultConfig,
  ...(db as DbConfig),
} as DataSourceOptions);
