import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getDataSourceByName } from 'typeorm-transactional/dist/common';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { Type } from '@nestjs/common';
import * as path from 'node:path';

export function setupTypeormModule(
  appDir: string,
  optionsFactory: Type<TypeOrmOptionsFactory> = TypeOrmConfigService,
) {
  return TypeOrmModule.forRootAsync({
    useClass: optionsFactory,
    dataSourceFactory: async (baseOptions?: DataSourceOptions) => {
      /* istanbul ignore next */
      if (!baseOptions) {
        // this will be a startup error we don't need to cover it with tests
        throw new Error(`Can not initialize data source, options are empty`);
      }

      // it's needed only for e2e tests
      const existDatasource = getDataSourceByName('default');

      if (existDatasource) {
        return existDatasource;
      }

      const options = {
        ...baseOptions,
        // eslint-disable-next-line @typescript-eslint/ban-types
        migrations: updateMigrationsPaths(baseOptions, appDir),
      };

      const dataSource = new DataSource(options);
      addTransactionalDataSource(dataSource);

      return await dataSource.initialize();
    },
  });
}

function updateMigrationsPaths(options: TypeOrmModuleOptions, appDir: string) {
  if (options?.migrations === undefined || options?.migrations === null) {
    return;
  }

  if (Array.isArray(options?.migrations)) {
    return options?.migrations?.map((m) => {
      return typeof m === 'string'
        ? path.join(appDir, m)
        : /* istanbul ignore next */ m;
    });
  }
  // typeorm created a MixedList type that can be an object, but it's not documented
  /* istanbul ignore next */
  return options.migrations;
}
