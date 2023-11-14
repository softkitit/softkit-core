import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import {
  IAccessTokenPayloadWithTenantsInfo,
  IRefreshTokenPayload,
  PermissionsBaseJwtPayload,
} from '../lib/vo/payload';
import { TokenService } from '../lib/services/token.service';
import { TestAppModule } from './app/app.module';
import {
  generateEmptyPermissionsPayload,
  generateRefreshTokenPayload,
} from './generators/tokens-payload';
import {
  AbstractTenantResolutionService,
  HeaderTenantResolutionService,
  JwtPayloadTenantResolutionService,
} from '../lib/multi-tenancy';
import { HttpStatus } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('test auth with multi tenant environment', () => {
  const accessTokenPayload: PermissionsBaseJwtPayload =
    generateEmptyPermissionsPayload();

  const refreshTokenPayload: IRefreshTokenPayload =
    generateRefreshTokenPayload();

  const payloadToSign = {
    accessTokenPayload,
    refreshTokenPayload,
  };

  describe('test header tenant resolution', () => {
    let app: NestFastifyApplication;
    let tokenService: TokenService;

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [TestAppModule],
      })
        .overrideProvider(AbstractTenantResolutionService)
        .useClass(HeaderTenantResolutionService)
        .compile();

      app = module.createNestApplication(new FastifyAdapter());
      tokenService = module.get<TokenService>(TokenService);
      await app.listen(0);
    });

    it('should successfully resolve tenant', async () => {
      const tenantId = faker.string.uuid();
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          ['x-tenant-id']: tenantId,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      const responseJson = JSON.parse(response.body);
      const resolvedTenantId = responseJson.tenantId;

      expect(resolvedTenantId).toEqual(tenantId);
    });

    it('should not fail if there is no header', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      const responseJson = JSON.parse(response.body);

      expect(responseJson.tenantId).toBeUndefined();
    });

    it('should successfully resolve tenant for secured endpoint', async () => {
      const tenantId = faker.string.uuid();
      const multiTenantPayload: IAccessTokenPayloadWithTenantsInfo<unknown> = {
        ...accessTokenPayload,
        tenants: [{ tenantId, roles: [] }],
      };

      const tokens = await tokenService.signTokens({
        accessTokenPayload: multiTenantPayload,
        refreshTokenPayload,
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          ['x-tenant-id']: tenantId,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      const responseJson = JSON.parse(response.body);
      const resolvedTenantId = responseJson.tenantId;

      expect(resolvedTenantId).toEqual(tenantId);
    });

    it('should fail with 403 if tenants is not present in list', async () => {
      const tenantId = faker.string.uuid();
      const multiTenantPayload = {
        ...accessTokenPayload,
      };

      const tokens = await tokenService.signTokens({
        accessTokenPayload: multiTenantPayload,
        refreshTokenPayload,
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          ['x-tenant-id']: tenantId,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should not fail if there is no header for secured endpoint', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      const responseJson = JSON.parse(response.body);

      expect(responseJson.tenantId).toBeUndefined();
    });
  });

  describe('test jwt payload tenant resolution', () => {
    let app: NestFastifyApplication;
    let tokenService: TokenService<PermissionsBaseJwtPayload>;

    const accessTokenPayloadWithTenantId = {
      ...accessTokenPayload,
      tenantId: faker.string.uuid(),
    };

    const payloadToSignWithTenantId = {
      accessTokenPayload: accessTokenPayloadWithTenantId,
      refreshTokenPayload,
    };

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [TestAppModule],
      })
        .overrideProvider(AbstractTenantResolutionService)
        .useClass(JwtPayloadTenantResolutionService)
        .compile();

      app = module.createNestApplication(new FastifyAdapter());
      tokenService = module.get<TokenService>(TokenService);
      await app.listen(0);
    });

    it('should fail and do not resolve tenant for skip auth endpoints', async () => {
      const tokens = await tokenService.signTokens(payloadToSignWithTenantId);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      const responseBody = JSON.parse(response.body);

      expect(responseBody.tenantId).toBeUndefined();
    });

    it('should not fail on token without tenantId for skip auth endpoint', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);

      expect(JSON.parse(response.body).tenantId).toBeUndefined();
    });

    it('should resolve tenant for secured endpoints', async () => {
      const tokens = await tokenService.signTokens(payloadToSignWithTenantId);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      expect(response.statusCode).toEqual(HttpStatus.OK);

      const responseBody = JSON.parse(response.body);

      expect(responseBody.tenantId).toBe(
        accessTokenPayloadWithTenantId.tenantId,
      );
    });

    it('should fail on secure endpoint and token without tenant id', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/cls-store',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
