import { Controller, Get, HttpStatus } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { FastifyRequest } from 'fastify';
import { ClsModule } from 'nestjs-cls';
import { AuthConfig } from '../lib/config/auth';
import { CurrentUser } from '../lib/decorators/current-user.decorator';
import { JwtAuthGuard } from '../lib/guards/jwt-auth.guard';
import { JwtPayload } from '../lib/vo/payload';
import { JwtStrategy } from '../lib/strategies/jwt.strategy';
import { PermissionsGuard } from '../lib/guards/permission.guard';
import { Roles } from '../lib/decorators/role.decorator';
import { Permissions } from '../lib/decorators/permission.decorator';
import { SkipAuth } from '../lib/decorators/skip-auth.decorator';
import { TokenService } from '../lib/services/token.service';
import { RolesGuard } from '../lib/guards/role.guard';
import { AuthConfigMock } from './utils/auth-config.mock';

describe('test auth', () => {
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
      controllers: [SkipAuthController, AuthController, AuthRolesController],
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
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
    }).compile();

    tokenService = module.get(TokenService);
    app = module.createNestApplication(new FastifyAdapter());
    tokenService = module.get(TokenService);
    await app.listen(0);
  });

  describe('test skip auth controller', () => {
    test('skip auth controller test with valid token', async () => {
      const tokens = await tokenService.signTokens(emptyPermissionsPayload);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('skip auth controller test without valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth',
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('skip auth controller and method with permission guard should fail', async () => {
      const tokens = await tokenService.signTokens(emptyPermissionsPayload);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth/secured',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('test auth controller with roles various cases', () => {
    test('no roles should be just authorized', async () => {
      const tokens = await tokenService.signTokens(emptyPermissionsPayload);

      const response = await app.inject({
        method: 'GET',
        url: 'auth-roles/no-roles',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('single role test', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
        roles: ['admin'],
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth-roles/one-role',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('skip auth and roles decorator in use', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
        roles: ['admin'],
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth-roles/skip-auth',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    test('no token test for roles', async () => {
      const response = await app.inject({
        method: 'GET',
        url: 'auth-roles/one-role',
      });

      // without an interceptor the response is 500
      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it.each([
      ['admin'],
      ['plain'],
      ['admin', 'aaa'],
      ['plain', 'aaa'],
      ['admin', 'plain'],
      ['admin', 'plain', 'aaa'],
    ])('multiple-exact-roles test with valid token', async (...roles) => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
        roles,
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth-roles/multiple-exact-roles',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });
  });

  describe('test auth controller with permissions various cases', () => {
    test('no permissions should be just authorized', async () => {
      const tokens = await tokenService.signTokens(emptyPermissionsPayload);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/no-permission',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('get current user decorator test', async () => {
      const tokens = await tokenService.signTokens(emptyPermissionsPayload);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/current-user',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(response.body) as JwtPayload & {
        iat?: number;
        exp?: number;
      };

      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();

      delete payload.iat;
      delete payload.exp;

      expect({
        ...payload,
      }).toStrictEqual(emptyPermissionsPayload);
    });

    test('skip auth method annotation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: 'auth/skip-auth',
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('first-level-any-permission method with valid permission annotation', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
        permissions: ['admin'],
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth/first-level-any-permission',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('second-level-any-permission method with valid permission annotation', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
        permissions: ['admin.user'],
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth/second-level-any-permission',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('no token test', async () => {
      const response = await app.inject({
        method: 'GET',
        url: 'auth/second-level-any-permission',
      });

      // without an interceptor the response is 500
      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    test('exact-permission method with valid permission annotation', async () => {
      const tokens = await tokenService.signTokens({
        ...emptyPermissionsPayload,
        permissions: ['admin.user.create'],
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth/skip-auth',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    it.each([
      ['admin.user.create'],
      ['admin.user.update'],
      ['admin.user.create', 'admin.user.update'],
      ['admin.user.create', 'admin.user.update', 'admin.user.random'],
      ['admin.user.create', 'admin.user.random'],
      ['admin.user.random', 'admin.user.update'],
    ])(
      'multiple-exact-permissions method with valid permission annotation',
      async (...permissions) => {
        const tokens = await tokenService.signTokens({
          ...emptyPermissionsPayload,
          permissions,
        });

        const response = await app.inject({
          method: 'GET',
          url: 'auth/multiple-exact-permissions',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual('hello');
      },
    );

    it.each([
      ['admin.user.createeee'],
      ['admin.user.updateeee'],
      ['admin.user.createee', 'admin.user.updateeee'],
      ['admin.user.createe', 'admin.user.updatee', 'admin.user.random'],
      ['admin.user.createe', 'admin.user.randome'],
      ['admin.user.randome', 'admin.user.updatee'],
    ])(
      'multiple-exact-permissions method with invalid permission annotation',
      async (...permissions) => {
        const tokens = await tokenService.signTokens({
          ...emptyPermissionsPayload,
          permissions,
        });

        const response = await app.inject({
          method: 'GET',
          url: 'auth/multiple-exact-permissions',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
      },
    );
  });

  describe('test refresh token auth guard and strategy', () => {
    it.todo('implement refresh token tests');
  });
});

@Controller('skip-auth')
@SkipAuth()
class SkipAuthController {
  @Get()
  async skipAuth() {
    return 'hello';
  }

  @Get('secured')
  @Permissions('allow')
  async withPermission() {
    return 'hello';
  }
}

@Controller('auth')
class AuthController {
  @Get('skip-auth')
  @SkipAuth()
  async skipAuth() {
    return 'hello';
  }

  @Get('no-permission')
  async noPermission() {
    return 'hello';
  }

  @Get('current-user')
  async userTest(@CurrentUser() payload: JwtPayload) {
    return payload;
  }

  @Get('first-level-any-permission')
  @Permissions('admin')
  async anyAdmin() {
    return 'hello';
  }

  @Get('second-level-any-permission')
  @Permissions('admin.user')
  async inviteUser() {
    return 'hello';
  }

  @Get('multiple-exact-permissions')
  @Permissions('admin.user.create', 'admin.user.update')
  async createOrUpdate() {
    return 'hello';
  }
}

@Controller('auth-roles')
class AuthRolesController {
  @Get('one-role')
  @Roles('admin')
  async anyAdmin() {
    return 'hello';
  }

  @Get('multiple-exact-roles')
  @Roles('admin', 'plain')
  async multiplePermissions() {
    return 'hello';
  }

  @SkipAuth()
  @Get('skip-auth')
  @Roles('admin', 'plain')
  async skipAuthAndRoles() {
    return 'hello';
  }

  @Get('no-roles')
  @Roles()
  async emptyList() {
    return 'hello';
  }
}
