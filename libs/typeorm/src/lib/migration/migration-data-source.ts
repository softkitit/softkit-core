import { Module } from '@nestjs/common';

import * as path from 'node:path';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DbConfig } from '../config/db';
import { NestFactory } from '@nestjs/core';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class RootConfig {
  @Type(() => DbConfig)
  @ValidateNested()
  public readonly db!: DbConfig;
}

@Module({
  imports: [setupYamlBaseConfigModule(__dirname, RootConfig)],
})
class DatabaseMigrationModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    DatabaseMigrationModule,
    {
      logger: ['warn', 'error', 'fatal', 'verbose'],
    },
  );

  return app.get(RootConfig).db;
}

const sourceDir = path.join(
  process.cwd(),
  // todo figure out how to improve it using nx
  `apps/${process.env['MIGRATION_APP_NAME']}/src`,
);

const appDir = path.join(sourceDir, 'app');

export const AppDataSource = bootstrap().then((db) => {
  return new DataSource({
    ...(db as DbConfig),
    entities: [path.join(appDir, 'database/entities/**/*{.ts,.js}')],
    migrations: [
      path.join(appDir, 'database/migrations/**/!(*index){.ts,.js}'),
    ],
  } as DataSourceOptions);
});
