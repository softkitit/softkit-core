import { Module } from '@nestjs/common';
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
import { setupI18NModule } from '@saas-buildkit/i18n';
import { setupLoggerModule } from '@saas-buildkit/logger';
import { setupYamlBaseConfigModule } from '@saas-buildkit/config';
import { setupClsModule } from '@saas-buildkit/async-storage';
import { TypeOrmConfigService } from '@saas-buildkit/typeorm';
import { Logger } from '@nestjs/common';
import {
  JwtAuthGuard,
  JwtStrategy,
  PermissionsGuard,
  TokenService,
} from '@saas-buildkit/auth';

/* istanbul ignore next */
@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(Entities)),
    JwtModule,
    setupI18NModule(
      path.join(__dirname, './i18n'),
      path.join(__dirname, './generated/i18n.generated.ts'),
    ),
    setupLoggerModule(),
    setupYamlBaseConfigModule(path.join(__dirname, './assets'), RootConfig),
    setupClsModule(),
    TypeOrmModule.forRootAsync({
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
