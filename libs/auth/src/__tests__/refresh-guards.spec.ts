import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { FastifyRequest } from 'fastify';
import { ClsModule } from 'nestjs-cls';
import { RefreshJwtAuthGuard } from '../lib/guards/refresh-jwt-auth.guard';
import { SkipAuth } from '../lib/decorators/skip-auth.decorator';
import { Permissions } from '../lib/decorators/permission.decorator';
import { TokenService } from '../lib/services/token.service';
import { JwtPayload } from '../lib/vo/payload';
import { JwtStrategy } from '../lib/strategies/jwt.strategy';
import { AuthConfig } from '../lib/config/auth';
import { JwtAuthGuard } from '../lib/guards/jwt-auth.guard';
import { PermissionsGuard } from '../lib/guards/permission.guard';
import { AuthConfigMock } from './utils/auth-config.mock';

describe('test refresh auth', () => {
  let tokenService: TokenService;
  let app: NestFastifyApplication;

  const emptyPermissionsPayload: JwtPayload = {
    sub: 'userid',
    email: 'someemail',
    roles: [],
    permissions: [],
    tenantId: 'tenant',
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
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
      controllers: [SkipAuthController],
      providers: [
        TokenService,
        JwtService,
        JwtStrategy,
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
          useClass: PermissionsGuard,
        },
      ],
    }).compile();

    tokenService = module.get(TokenService);
    app = module.createNestApplication(new FastifyAdapter());
    tokenService = module.get(TokenService);
    await app.listen(0);
  });

  describe('test refresh token auth guard and strategy', () => {
    it('should accept refresh token', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
      });

      const response = await app.inject({
        method: 'GET',
        url: 'refresh-auth',
        headers: {
          authorization: `Bearer ${tokens.refreshToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    it('should reject access token with 500', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
      });

      const response = await app.inject({
        method: 'GET',
        url: 'refresh-auth',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      // internal server error here because we don't have an interceptor to handle the error
      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should reject with no refresh token provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: 'refresh-auth',
      });

      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});

@Controller('refresh-auth')
@SkipAuth()
class SkipAuthController {
  @Get()
  @UseGuards(RefreshJwtAuthGuard)
  async refreshAuthGuard() {
    return 'hello';
  }

  @Get('secured')
  @Permissions('allow')
  async withPermission() {
    return 'hello';
  }
}
