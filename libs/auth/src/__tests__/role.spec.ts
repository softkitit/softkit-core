import { HttpStatus } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import {
  IRefreshTokenPayload,
  PermissionsBaseJwtPayload,
} from '../lib/vo/payload';
import { TokenService } from '../lib/services/token.service';
import { TestAppModule } from './app/app.module';
import {
  generateMultiTenantPayload,
  generateRefreshTokenPayload,
} from './generators/tokens-payload';
import { RoleType } from './app/controllers/vo/role-type';
import { AuthConfig } from '../lib/config/auth';
import {
  AbstractTenantResolutionService,
  HeaderTenantResolutionService,
} from '../lib/multi-tenancy';
import { faker } from '@faker-js/faker';

describe('role e2e tests', () => {
  let tokenService: TokenService<PermissionsBaseJwtPayload>;
  let authConfig: AuthConfig;
  let app: NestFastifyApplication;

  const accessTokenPayload = generateMultiTenantPayload([RoleType.ADMIN]);

  const refreshTokenPayload: IRefreshTokenPayload =
    generateRefreshTokenPayload();

  const payloadToSign = {
    accessTokenPayload,
    refreshTokenPayload,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider(AbstractTenantResolutionService)
      .useClass(HeaderTenantResolutionService)
      .compile();

    app = module.createNestApplication(new FastifyAdapter());
    tokenService = module.get<TokenService>(TokenService);
    authConfig = module.get<AuthConfig>(AuthConfig);
    await app.listen(0);
  });

  describe('verify roles endpoints success cases', () => {
    test('should validate admin role', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'roles/admin-only',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          [authConfig.headerTenantId]: accessTokenPayload.tenants[0].tenantId,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    it.each([
      [[RoleType.ADMIN]],
      [[RoleType.REGULAR]],
      [[RoleType.REGULAR, RoleType.ADMIN]],
      [[RoleType.REGULAR, RoleType.ADMIN, RoleType.NOT_USED]],
    ])(
      'should successfully validate admin or regular role: %s',
      async (roles: RoleType[]) => {
        const accessTokenData = generateMultiTenantPayload(roles);

        const tokens = await tokenService.signTokens({
          accessTokenPayload: accessTokenData,
          refreshTokenPayload,
        });

        const response = await app.inject({
          method: 'GET',
          url: 'roles/admin-or-regular',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
            [authConfig.headerTenantId]: accessTokenData.tenants[0].tenantId,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual('hello');
      },
    );

    it.each([
      [[RoleType.ADMIN], []],
      [[RoleType.REGULAR, RoleType.ADMIN], []],
      [
        [RoleType.REGULAR, RoleType.ADMIN, RoleType.NOT_USED],
        ['admin.user.create'],
      ],
      [[RoleType.NOT_USED], ['admin.user.create']],
      [[RoleType.REGULAR], ['admin.user.create']],
      [[], ['admin.user.update']],
      [[], ['admin.user.create', 'admin.user.update']],
      [[], ['admin.user.create', 'admin.user.update', 'admin.user.nono']],
    ])(
      'should successfully validate admin role: %s or permissions: %s',
      async (roles: RoleType[], permissions: string[]) => {
        const accessTokenData = generateMultiTenantPayload(roles, permissions);

        const tokens = await tokenService.signTokens({
          accessTokenPayload: accessTokenData,
          refreshTokenPayload,
        });

        const response = await app.inject({
          method: 'GET',
          url: 'roles/admin-or-permissions',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
            [authConfig.headerTenantId]: accessTokenData.tenants[0].tenantId,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.OK);
        expect(response.body).toEqual('hello');
      },
    );

    test('should fail if @SkipAuth used with @Roles decorator', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'roles/skip-auth-and-roles',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('verify roles endpoints failed cases', () => {
    it.each([
      [[RoleType.NOT_USED]],
      [[RoleType.NOT_USED, RoleType.NOT_USED]],
      [[]],
      [[null as unknown as RoleType]],
    ])(
      'should throw forbidden on wrong roles: %s',
      async (roles: RoleType[]) => {
        const accessTokenData = generateMultiTenantPayload(roles);

        const tokens = await tokenService.signTokens({
          accessTokenPayload: accessTokenData,
          refreshTokenPayload,
        });

        const response = await app.inject({
          method: 'GET',
          url: 'roles/admin-or-regular',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
            [authConfig.headerTenantId]: accessTokenData.tenants[0].tenantId,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
      },
    );

    it('should throw forbidden on wrong tenant: %s', async () => {
      const module = await Test.createTestingModule({
        imports: [TestAppModule],
      }).compile();

      const app: NestFastifyApplication = module.createNestApplication(
        new FastifyAdapter(),
      );
      const tokenService = module.get<TokenService>(TokenService);

      const tokens = await tokenService.signTokens(payloadToSign);

      await app.listen(0);

      const response = await app.inject({
        method: 'GET',
        url: 'roles/admin-or-regular',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          [authConfig.headerTenantId]: faker.string.uuid(),
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
    });

    it.each([
      [[RoleType.NOT_USED], []],
      [[RoleType.REGULAR], []],
      [[RoleType.REGULAR, RoleType.NOT_USED], []],
      [[], []],
      [[], ['admin.user.nothing']],
      [[RoleType.NOT_USED], ['admin.user.nope']],
      [[], ['admin.user.nope', 'admin.user.nothing']],
      [
        [RoleType.REGULAR, RoleType.NOT_USED],
        ['admin.user.nope', 'admin.user.nothing'],
      ],
    ])(
      'should throw forbidden on role: %s and permissions: %s',
      async (roles: RoleType[], permissions: string[]) => {
        const accessTokenData = generateMultiTenantPayload(roles, permissions);

        const tokens = await tokenService.signTokens({
          accessTokenPayload: accessTokenData,
          refreshTokenPayload,
        });

        const response = await app.inject({
          method: 'GET',
          url: 'roles/admin-or-permissions',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
            [authConfig.headerTenantId]: accessTokenData.tenants[0].tenantId,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
      },
    );
  });
});
