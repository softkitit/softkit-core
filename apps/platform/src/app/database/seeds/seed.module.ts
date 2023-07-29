import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import RootConfig from '../../config/root.config';

import { TenantSeedModule } from './tenant/tenant-seed.module';

import { UserSeedModule } from './user/user-seed.module';

import { SamlConfigurationSeedModule } from './saml-configuration/saml-configuration-seed.module';

import { RolesSeedModule } from './roles/roles-seed.module';
import { TypeOrmConfigService } from '@saas-buildkit/typeorm';
import { setupYamlBaseConfigModule } from '@saas-buildkit/config';

@Module({
  imports: [
    RolesSeedModule,
    SamlConfigurationSeedModule,
    UserSeedModule,
    TenantSeedModule,
    setupYamlBaseConfigModule(__dirname, RootConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options?: DataSourceOptions) => {
        if (!options) {
          throw new Error(`Can not initialize data source, options are empty`);
        }

        return await new DataSource({
          ...options,
        }).initialize();
      },
    }),
  ],
})
export class SeedModule {}
