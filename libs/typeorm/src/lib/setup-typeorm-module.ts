import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getDataSourceByName } from 'typeorm-transactional/dist/common';
import { addTransactionalDataSource } from 'typeorm-transactional';

export function setupTypeormModule() {
  return TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options?: DataSourceOptions) => {
      if (!options) {
        // this will be a startup error we don't need to cover it with tests
        /* istanbul ignore next */
        throw new Error(`Can not initialize data source, options are empty`);
      }

      // it's needed only for e2e tests
      const existDatasource = getDataSourceByName('default');

      if (existDatasource) {
        return existDatasource;
      }

      const dataSource = new DataSource(options);
      addTransactionalDataSource(dataSource);

      return await dataSource.initialize();
    },
  });
}
