import { Module, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import RootConfig from './config/root.config';

import * as Controllers from './controllers';
import * as Entities from './database/entities';
import * as Migrations from './database/migrations';
import * as Repositories from './repositories';
import * as Services from './services';
import AbstractAuthUserService from './services/auth/abstract-auth-user.service';
import * as Seeders from './database/seeds';
import * as Factories from './database/factories';
import AuthUserService from './services/users/auth-user.service';
import { setupI18NModule } from '@softkit/i18n';
import { setupLoggerModule } from '@softkit/logger';
import { setupYamlBaseConfigModule } from '@softkit/config';
import { setupClsModule } from '@softkit/async-storage';
import {
  AbstractAccessCheckService,
  AbstractTenantResolutionService,
  AbstractTokenBuilderService,
  HeaderTenantResolutionService,
  JwtAuthGuard,
  JwtStrategy,
  PermissionsGuard,
  TokenService,
} from '@softkit/auth';
import { PlatformClientModule } from '@softkit/platform-client';
import { HealthCheckModule } from '@softkit/healthcheck';
import {
  setupTypeormModule,
  TYPEORM_FACTORIES_TOKEN,
  TYPEORM_SEEDERS_TOKEN,
} from '@softkit/typeorm';
import { MultiTenantTokenBuilderService } from './services/auth/token/multi-tenant-token-builder.service';
import { AccessCheckService, SignupService } from './services';
import { AbstractSignupService } from './services/auth/signup/signup.service.interface';

@Module({
  imports: [
    JwtModule,
    setupI18NModule(__dirname),
    setupLoggerModule(),
    setupYamlBaseConfigModule(__dirname, RootConfig),
    setupClsModule(),
    setupTypeormModule({
      migrations: Migrations,
    }),
    TypeOrmModule.forFeature(Object.values(Entities)),
    PlatformClientModule,
    HealthCheckModule,
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
      provide: TYPEORM_SEEDERS_TOKEN,
      useValue: Object.values(Seeders),
    },
    {
      provide: TYPEORM_FACTORIES_TOKEN,
      useValue: Object.values(Factories),
    },
    {
      provide: AbstractAuthUserService,
      useClass: AuthUserService,
    },
    {
      provide: AbstractTokenBuilderService,
      useClass: MultiTenantTokenBuilderService,
    },
    {
      provide: AbstractTenantResolutionService,
      useClass: HeaderTenantResolutionService,
    },
    {
      provide: AbstractAccessCheckService,
      useClass: AccessCheckService,
    },
    {
      provide: AbstractSignupService,
      useClass: SignupService,
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
