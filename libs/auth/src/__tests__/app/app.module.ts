import { Module } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { TokenService } from '../../lib/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../lib/strategies/jwt.strategy';
import { AuthConfigMock } from './config/auth-config.mock';
import { AuthConfig } from '../../lib/config/auth';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../lib/guards/jwt-auth.guard';
import { AccessGuard } from '../../lib/guards/access.guard';
import { SkipAuthController } from './controllers/skip-auth.controller';
import { AuthController } from './controllers/auth.controller';
import { ClsModule } from 'nestjs-cls/dist/src/lib/cls.module';
import { RefreshTokenAuthController } from './controllers/refresh-token-auth.controller';
import { TokenAccessCheckService } from '../../lib/services/token-access-check.service';
import { AbstractAccessCheckService } from '../../lib/services/access-check.service';
import { AbstractTenantResolutionService } from '../../lib/multi-tenancy';
import { NoOpTenantResolutionService } from './utils/no-op-tenant-resolution-service';
import { RolesController } from './controllers/roles.controller';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        setup: (cls, req: FastifyRequest) => {
          // put some additional default info in the CLS
          // eslint-disable-next-line security/detect-object-injection
          cls.set('requestId', req.id?.toString());
        },
        idGenerator: (req: FastifyRequest) => req.id.toString(),
      },
    }),
  ],
  controllers: [
    SkipAuthController,
    AuthController,
    RefreshTokenAuthController,
    RolesController,
  ],
  providers: [
    TokenService,
    JwtService,
    JwtStrategy,
    {
      useClass: TokenAccessCheckService,
      provide: AbstractAccessCheckService,
    },
    {
      useClass: NoOpTenantResolutionService,
      provide: AbstractTenantResolutionService,
    },
    {
      useClass: AuthConfigMock,
      provide: AuthConfig,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessGuard,
    },
  ],
})
export class TestAppModule {}
