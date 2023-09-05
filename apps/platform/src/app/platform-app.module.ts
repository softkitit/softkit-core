import { Module, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { getDataSourceByName } from 'typeorm-transactional/dist/common';

import RootConfig from './config/root.config';

import * as Controllers from './controllers';
import * as Entities from './database/entities';
import * as Repositories from './repositories';
import * as Services from './services';
import AbstractAuthUserService from './services/auth/abstract-auth-user-service';
import AuthUserService from './services/users/auth-user.service';
import { setupI18NModule } from '@softkit/i18n';
import { setupLoggerModule } from '@softkit/logger';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { setupClsModule } from '@softkit/async-storage';
import { TypeOrmConfigService } from '@softkit/typeorm';
import {
  JwtAuthGuard,
  JwtStrategy,
  PermissionsGuard,
  TokenService,
} from '@softkit/auth';
import { PlatformClientModule } from '@softkit/platform-client';
import { HealthCheckModule } from '@softkit/healthcheck';

/* istanbul ignore next */
@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(Entities)),
    JwtModule,
    setupI18NModule(__dirname),
    setupLoggerModule(),
    setupYamlBaseConfigModule(path.join(__dirname, './assets'), RootConfig),
    setupClsModule(),
    PlatformClientModule,
    HealthCheckModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options?: DataSourceOptions) => {
        if (!options) {
          // this will be a startup error we don't need to c over it with tests
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
    }),
  ],
  controllers: Object.values(Controllers),
  providers: [
    ...Object.values(Services),
    ...Object.values(Repositories),
    Logger,
    JwtStrategy,
    JwtService,
    TokenService,
    {
      provide: AbstractAuthUserService,
      useClass: AuthUserService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class PlatformAppModule {}
