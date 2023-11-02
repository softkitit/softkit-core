import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpByEmailWithTenantCreationRequest } from '../controllers/auth/vo/sign-up.dto';
import { TenantService, UserService } from '../services';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { MultiTenantTokenBuilderService } from '../services/auth/token/multi-tenant-token-builder.service';
import { NoTenantTokenBuilderService } from '../services/auth/token/no-tenant-token-builder.service';
import { SingleTenantTokenBuilderService } from '../services/auth/token/single-tenant-token-builder.service';
import { AbstractTokenBuilderService, TokenService } from '@softkit/auth';
import { UserProfileStatus } from '../database/entities/users/types/user-profile-status.enum';
import { successSignupDto } from './generators/signup';

describe('token builder tests e2e tests', () => {
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  describe.each([
    [
      {
        tokenBuilderService: MultiTenantTokenBuilderService,
      },
    ],
    [{ tokenBuilderService: NoTenantTokenBuilderService }],
    [
      {
        tokenBuilderService: SingleTenantTokenBuilderService,
      },
    ],
  ])('should build proper token by type: %s', ({ tokenBuilderService }) => {
    let app: NestFastifyApplication;
    let tokenService: TokenService;
    let userService: UserService;
    let tenantService: TenantService;

    let signupDto: SignUpByEmailWithTenantCreationRequest;

    beforeEach(async () => {
      signupDto = successSignupDto();

      const { PlatformAppModule } = require('../platform-app.module');

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [PlatformAppModule],
      })
        .overrideProvider(AbstractSignupService)
        .useClass(TenantSignupService)
        .overrideProvider(AbstractTokenBuilderService)
        .useClass(tokenBuilderService)
        .compile();
      app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

      tokenService = app.get(TokenService);
      tenantService = app.get(TenantService);
      userService = app.get(UserService);
    });

    afterEach(async () => {
      await app.close();
      jest.clearAllMocks();
    });

    it('should build a token with a proper params', async () => {
      await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: signupDto,
      });

      const tenant = await tenantService.findOne({
        where: {
          tenantFriendlyIdentifier: signupDto.companyIdentifier,
        },
      });

      const user = await userService.findOneByEmail(signupDto.email);

      await userService.updateUserStatus(user.id, UserProfileStatus.ACTIVE);

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signin',
        payload: {
          email: signupDto.email,
          password: signupDto.password,
        },
      });

      const signInResponseBody = response.json();

      const accessToken = signInResponseBody.data.accessToken;

      const tokenPayload: any =
        await tokenService.verifyAccessToken(accessToken);

      expect(tokenPayload.firstName).toBe(signupDto.firstName);
      expect(tokenPayload.lastName).toBe(signupDto.lastName);
      expect(tokenPayload.email).toBe(signupDto.email.toLowerCase());
      expect(tokenPayload.sub).toBe(user.id);
      expect(tokenPayload.iat).toBeGreaterThan(0);
      expect(tokenPayload.exp).toBeGreaterThan(0);

      if (tokenBuilderService instanceof MultiTenantTokenBuilderService) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(tokenPayload.tenants.length).toBe(1);
        const tenantInfo = tokenPayload.tenants[0];

        // eslint-disable-next-line jest/no-conditional-expect
        expect(tenantInfo.tenantId).toBe(tenant.id);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(tenantInfo.roles.length).toBe(1);
      } else if (tokenBuilderService instanceof NoTenantTokenBuilderService) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(tokenPayload.tenants).toBeUndefined();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(tokenPayload.tenantId).toBeUndefined();
      } else if (
        tokenBuilderService instanceof SingleTenantTokenBuilderService
      ) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(tokenPayload.tenantId).toBe(tenant.id);

        // eslint-disable-next-line jest/no-conditional-expect
        expect(tokenPayload.roles.length).toBe(1);
      }
    });
  });
});
