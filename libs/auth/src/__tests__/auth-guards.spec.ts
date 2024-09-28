import { HttpStatus } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  PermissionsBaseJwtPayload,
  RoleInfo,
  RolesBaseJwtPayload,
} from '../lib/vo/payload';
import { TokenService } from '../lib/services/token.service';
import { TestAppModule } from './app/app.module';
import { TestNoTenantAppModule } from './app/no-tenant-app.module';
import {
  generateEmptyPermissionsPayload,
  generateNoTenantPayload,
  generateRefreshTokenPayload,
} from './generators/tokens-payload';
import { RoleType } from './app/controllers/vo/role-type';

describe('test auth guards', () => {
  let tokenService: TokenService<PermissionsBaseJwtPayload>;
  let roleTokenService: TokenService<RolesBaseJwtPayload<RoleType>>;
  let app: NestFastifyApplication;

  const accessTokenPayload: PermissionsBaseJwtPayload =
    generateEmptyPermissionsPayload();

  const noTenantRoleAccessTokenPayload = generateNoTenantPayload([
    RoleType.ADMIN,
  ]);

  const refreshTokenPayload: IRefreshTokenPayload =
    generateRefreshTokenPayload();

  const payloadToSign = {
    accessTokenPayload,
    refreshTokenPayload,
  };

  describe('test auth controller without role checking', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [TestAppModule],
      }).compile();

      app = module.createNestApplication(new FastifyAdapter());
      tokenService = module.get<TokenService>(TokenService);
      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
      jest.resetAllMocks();
    });

    test('should skip token validation with proper token', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

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

    test('should skip token validation without valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth',
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('should fail if @SkipAuth used with @Permissions decorator', async () => {
      const tokens = await tokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'skip-auth/secured',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    describe('test auth controller with permissions various cases', () => {
      test('no permissions should be just authorized', async () => {
        const tokens = await tokenService.signTokens(payloadToSign);

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
        const tokens = await tokenService.signTokens(payloadToSign);

        const response = await app.inject({
          method: 'GET',
          url: 'auth/current-user',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.OK);

        const payload = JSON.parse(response.body) as IAccessTokenPayload & {
          iat?: number;
          exp?: number;
        };

        expect(payload.iat).toBeDefined();
        expect(payload.exp).toBeDefined();

        delete payload.iat;
        delete payload.exp;

        expect({
          ...payload,
        }).toStrictEqual(accessTokenPayload);
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
          ...payloadToSign,
          accessTokenPayload: {
            ...payloadToSign.accessTokenPayload,
            permissions: ['admin'],
          },
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
          ...payloadToSign,
          accessTokenPayload: {
            ...payloadToSign.accessTokenPayload,
            permissions: ['admin.user'],
          },
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
          ...payloadToSign,
          accessTokenPayload: {
            ...payloadToSign.accessTokenPayload,
            permissions: ['admin.user.create'],
          },
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
        'any-match method with valid permissions any match annotation: %s',
        async (...permissions) => {
          const tokens = await tokenService.signTokens({
            ...payloadToSign,
            accessTokenPayload: {
              ...payloadToSign.accessTokenPayload,
              permissions,
            },
          });

          const response = await app.inject({
            method: 'GET',
            url: 'auth/any-match',
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
        null,
        undefined,
        [],
      ])(
        'any-match method with invalid permission annotation: %s',
        async (permissions) => {
          const tokens = await tokenService.signTokens({
            ...payloadToSign,
            accessTokenPayload: {
              ...payloadToSign.accessTokenPayload,
              permissions: permissions as string[],
            },
          });

          const response = await app.inject({
            method: 'GET',
            url: 'auth/any-match',
            headers: {
              authorization: `Bearer ${tokens.accessToken}`,
            },
          });

          expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
        },
      );

      describe('test permission decorator with each mode', () => {
        it.each([
          ['admin.user.create'],
          ['admin.user.update'],
          ['admin.user.create', 'admin.user.updateeeeee'],
          ['admin.user.createeeee', 'admin.user.update'],
          [],
          undefined,
          null,
        ])('each method with invalid permissions: %s', async (permissions) => {
          const tokens = await tokenService.signTokens({
            ...payloadToSign,
            accessTokenPayload: {
              ...payloadToSign.accessTokenPayload,
              permissions: permissions as string[],
            },
          });

          const response = await app.inject({
            method: 'GET',
            url: 'auth/each-match',
            headers: {
              authorization: `Bearer ${tokens.accessToken}`,
            },
          });

          expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
        });
      });

      it.each([
        ['admin.user.create', 'admin.user.update'],
        ['admin.user.create', 'admin.user.update', 'admin.user.anything.else'],
        [
          'admin.user.create',
          'admin.user.update',
          'admin.user.anything.else',
          'admin.user.anything.bla',
        ],
        ['admin.user.create', 'admin.user.update', 'admin.user.update'],
      ])('each method with valid permissions: %s', async (...permissions) => {
        const tokens = await tokenService.signTokens({
          ...payloadToSign,
          accessTokenPayload: {
            ...payloadToSign.accessTokenPayload,
            permissions,
          },
        });

        const response = await app.inject({
          method: 'GET',
          url: 'auth/each-match',
          headers: {
            authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        expect(response.statusCode).toEqual(HttpStatus.OK);
      });

      describe('test permission decorator with invalid permissions', () => {
        it.each([
          ['admin.user.create'],
          ['admin.user.update'],
          ['admin.user.create', 'admin.user.updateeeeee'],
          ['admin.user.createeeee', 'admin.user.update'],
          [],
          undefined,
          null,
        ])('each method with invalid permissions: %s', async (permissions) => {
          const tokens = await tokenService.signTokens({
            ...payloadToSign,
            accessTokenPayload: {
              ...payloadToSign.accessTokenPayload,
              permissions: permissions as string[],
            },
          });

          const response = await app.inject({
            method: 'GET',
            url: 'auth/each-match',
            headers: {
              authorization: `Bearer ${tokens.accessToken}`,
            },
          });

          expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
        });
      });
    });

    it.each([
      ['admin.user.create', 'admin.user.update'],
      ['admin.user.create', 'admin.user.update', 'admin.user.anything.else'],
      [
        'admin.user.create',
        'admin.user.update',
        'admin.user.anything.else',
        'admin.user.anything.bla',
      ],
      ['admin.user.create', 'admin.user.update', 'admin.user.update'],
    ])('each method with valid permissions: %s', async (...permissions) => {
      const tokens = await tokenService.signTokens({
        ...payloadToSign,
        accessTokenPayload: {
          ...payloadToSign.accessTokenPayload,
          permissions,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: 'auth/each-match',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
    });
  });

  describe('test auth controller with roles various cases', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [TestNoTenantAppModule],
      }).compile();

      app = module.createNestApplication(new FastifyAdapter());
      roleTokenService = module.get<TokenService>(TokenService);
      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
      jest.resetAllMocks();
    });

    test('admin role decorator with default - any check mode', async () => {
      const payloadToSign = {
        accessTokenPayload: noTenantRoleAccessTokenPayload,
        refreshTokenPayload,
        permissions: [],
      };
      const tokens = await roleTokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/admin-role-default-check-mode',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('admin role decorator with each check mode', async () => {
      const payloadToSign = {
        accessTokenPayload: noTenantRoleAccessTokenPayload,
        refreshTokenPayload,
        permissions: [],
      };
      const tokens = await roleTokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/admin-role-each-check-mode',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual('hello');
    });

    test('admin role decorator without roles and any check mode', async () => {
      const payloadToSign = {
        accessTokenPayload: {
          ...noTenantRoleAccessTokenPayload,
          roles: undefined as unknown as RoleInfo<RoleType>[],
        },
        refreshTokenPayload,
        permissions: [],
      };
      const tokens = await roleTokenService.signTokens(payloadToSign);

      const response = await app.inject({
        method: 'GET',
        url: 'auth/admin-role-any-check-mode',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
    });

    test('admin role decorator without roles and each check mode', async () => {
      const payloadToSign = {
        accessTokenPayload: {
          ...noTenantRoleAccessTokenPayload,
          roles: undefined as unknown as RoleInfo<RoleType>[],
        },
        refreshTokenPayload,
        permissions: [],
      };
      const tokens = await roleTokenService.signTokens(payloadToSign);
      const response = await app.inject({
        method: 'GET',
        url: 'auth/admin-role-each-check-mode',
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(HttpStatus.FORBIDDEN);
    });
  });
});
