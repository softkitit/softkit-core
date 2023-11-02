import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleWithoutPermission } from '../controllers/roles/vo/role.dto';
import { UserRole, Tenant } from '../database/entities';
import {
  ExternalApprovalService,
  TenantService,
  UserRoleService,
} from '../services';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { Paginated } from 'nestjs-paginate';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { ApproveSignUpRequest } from '../controllers/auth/vo/approve.dto';
import { SignUpByEmailWithTenantCreationRequest } from '../controllers/auth/vo/sign-up.dto';
import { SignInRequest } from '@softkit/platform-client';
import { AuthConfig } from '@softkit/auth';

const successSignupDto: SignUpByEmailWithTenantCreationRequest = {
  email: faker.internet.email(),
  password: '12345Aa!',
  repeatedPassword: '12345Aa!',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  companyIdentifier: faker.company.name(),
  companyName: faker.company.name(),
};

describe('roles e2e test', () => {
  let app: NestFastifyApplication;
  let rolesService: UserRoleService;
  let accessToken: string;
  let tenant: Tenant;
  let db: StartedDb;
  let authConfig: AuthConfig;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    successSignupDto.email = faker.internet.email({
      provider: 'gmail' + faker.string.alphanumeric(10).toString() + '.com',
    });

    const { PlatformAppModule } = require('../platform-app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(TenantSignupService)
      .compile();

    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

    rolesService = app.get(UserRoleService);
    authConfig = app.get(AuthConfig);

    const tenantService = app.get(TenantService);
    const approvalService = app.get(ExternalApprovalService);

    const signUpResponse = await app.inject({
      method: 'POST',
      url: 'api/platform/v1/auth/tenant-signup',
      payload: successSignupDto,
    });

    const approval = await approvalService.findOne({
      where: {
        id: signUpResponse.json().data.approvalId,
      },
    });

    await app.inject({
      method: 'POST',
      url: 'api/platform/v1/auth/approve-signup',
      payload: {
        id: approval.id,
        code: approval.code,
      } as ApproveSignUpRequest,
    });

    const token = await app.inject({
      method: 'POST',
      url: 'api/platform/v1/auth/signin',
      payload: {
        email: successSignupDto.email,
        password: successSignupDto.password,
      } satisfies SignInRequest,
    });

    accessToken = token.json().data.accessToken;

    tenant = await tenantService.findOne({
      where: {
        tenantFriendlyIdentifier: successSignupDto.companyIdentifier,
      },
    });
  });

  afterEach(async () => {
    await app.flushLogs();
    await app.close();
  });

  describe('find roles test', () => {
    it('find all roles for tenant', async () => {
      const role = await rolesService.createOrUpdateEntity({
        name: faker.string.alpha(20),
        description: faker.string.alpha(200),
        tenantId: tenant.id,
      } as any as UserRole);

      const response = await app.inject({
        method: 'GET',
        url: `api/platform/v1/roles`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          [authConfig.headerTenantId]: tenant.id,
        },
      });

      expect(response.statusCode).toEqual(200);

      const responseBody: Paginated<UserRoleWithoutPermission> =
        response.json();

      expect(responseBody.data.length).toEqual(4);
      const paginationResponse =
        responseBody.data as UserRoleWithoutPermission[];

      const newlyCreatedRoles = paginationResponse.filter((p) => !!p.tenantId);

      expect(newlyCreatedRoles.length).toEqual(1);

      const defaultRolesWithoutTenants = paginationResponse.filter(
        (p) => !p.tenantId,
      );

      expect(defaultRolesWithoutTenants.length).toEqual(3);

      const createdRole = newlyCreatedRoles[0];

      expect(createdRole.id).toEqual(role.id);
      expect(createdRole.name).toEqual(role.name);
      expect(createdRole.description).toEqual(role.description);
      expect(createdRole.tenantId).toEqual(role.tenantId);
      expect(createdRole.roleType).toBeNull();
    });
  });
});
