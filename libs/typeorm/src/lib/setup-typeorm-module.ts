import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getDataSourceByName } from 'typeorm-transactional/dist/common';
import { addTransactionalDataSource } from 'typeorm-transactional';
import {
  DEFAULT_SETUP_TYPEORM_OPTIONS,
  SetupTypeormOptions,
} from './vo/setup-typeorm-options';

export function setupTypeormModule(options?: SetupTypeormOptions) {
  const optionsWithDefault = {
    ...DEFAULT_SETUP_TYPEORM_OPTIONS,
    ...options,
  };

  return TypeOrmModule.forRootAsync({
    useClass: optionsWithDefault.optionsFactory,
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
        migrations: optionsWithDefault.migrations,
      };

      const dataSource = new DataSource(options);
      addTransactionalDataSource(dataSource);

      return await dataSource.initialize();
    },
  });
}
