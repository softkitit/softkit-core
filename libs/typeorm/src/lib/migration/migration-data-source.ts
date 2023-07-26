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

const assetsDir = path.join(sourceDir, 'assets')
const appDir = path.join(sourceDir, 'app')
console.log('Configuration file source dir - ', sourceDir);

const { db } = fileLoader({
  absolutePath: path.join(assetsDir, '.env.yaml'),
  ignoreEnvironmentVariableSubstitution: false,
})() as { db: DbConfig };


db.entities = db.entities.map((e) => `${path.join(appDir, e)}`);
db.migrations = db.migrations.map((e) => `${path.join(appDir, e)}`);

console.log(db.entities)

// populate default values for missing properties from DbConfig file
const defaultConfig = new DbConfig();

export const AppDataSource = new DataSource({
  ...defaultConfig,
  ...(db as DbConfig),
} as DataSourceOptions);
