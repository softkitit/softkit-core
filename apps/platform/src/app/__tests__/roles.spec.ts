import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import {
  UpdateUserRole,
  UserRoleWithoutPermission,
} from '../controllers/roles/vo/role.dto';
import { Tenant, UserRole } from '../database/entities';
import { UserRoleService } from '../services';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { Paginated } from 'nestjs-paginate';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { AuthConfig } from '@softkit/auth';
import { createRole } from './generators/role';
import { registerTenant } from './generators/user';

function verifyEntity(
  responseBody: UserRoleWithoutPermission,
  expected: Partial<UserRoleWithoutPermission>,
  excludedFields: string[] = [],
) {
  const keys = Object.keys(expected).filter((k) => !excludedFields.includes(k));

  for (const key of keys) {
    expect(expected[key]).toEqual(responseBody[key]);
  }

  expect(responseBody.createdAt).not.toBeNil();
  expect(responseBody.updatedAt).not.toBeNil();
  expect(responseBody.id).not.toBeNil();
  expect(responseBody.tenantId).not.toBeNil();
  expect(responseBody.version).toBeGreaterThanOrEqual(1);
}

describe('roles e2e test', () => {
  let app: NestFastifyApplication;
  let service: UserRoleService;
  let accessToken: string;
  let currentTenant: Tenant;
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
    const { PlatformAppModule } = require('../platform-app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(TenantSignupService)
      .compile();

    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

    service = app.get<UserRoleService>(UserRoleService);
    authConfig = app.get<AuthConfig>(AuthConfig);

    const { tenant, adminAccessToken } = await registerTenant(app);

    accessToken = adminAccessToken;
    currentTenant = tenant;
  });

  afterEach(async () => {
    await app.flushLogs();
    await app.close();
  });

  it('should find all roles, GET api/platform/v1/roles', async () => {
    const role = await service.createOrUpdateEntity({
      ...createRole(),
      tenantId: currentTenant.id,
    } as any as UserRole);

    const response = await app.inject({
      method: 'GET',
      url: `api/platform/v1/roles`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });

    expect(response.statusCode).toEqual(200);

    const responseBody: Paginated<UserRoleWithoutPermission> = response.json();

    expect(responseBody.data.length).toEqual(4);
    const paginationResponse = responseBody.data as UserRoleWithoutPermission[];

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
    expect(createdRole.version).toBeGreaterThan(0);
  });

  it('should create role, POST: api/platform/v1/roles', async () => {
    const role = createRole();

    const response = await app.inject({
      method: 'POST',
      url: 'api/platform/v1/roles',
      payload: role,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });
    const responseBody = response.json<UserRoleWithoutPermission>();

    expect(response.statusCode).toEqual(201);
    verifyEntity(responseBody, role);
  });

  it('should find one by id, GET: api/platform/v1/roles/:id', async () => {
    const role = createRole();

    const createResponse = await app.inject({
      method: 'POST',
      url: 'api/platform/v1/roles',
      payload: role,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });
    const createResponseBody = createResponse.json<UserRoleWithoutPermission>();

    expect(createResponse.statusCode).toEqual(201);
    verifyEntity(createResponseBody, role);

    const findResponse = await app.inject({
      method: 'GET',
      url: `api/platform/v1/roles/${createResponseBody.id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });

    expect(findResponse.statusCode).toEqual(200);

    const findResponseBody = findResponse.json<UserRoleWithoutPermission>();

    expect(findResponseBody).toStrictEqual(createResponseBody);
  });

  it('should update role, PUT: api/platform/v1/roles/:id', async () => {
    const role = createRole();

    const createResponse = await app.inject({
      method: 'POST',
      url: 'api/platform/v1/roles',
      payload: role,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });
    const createResponseBody = createResponse.json<UserRoleWithoutPermission>();

    expect(createResponse.statusCode).toEqual(201);
    verifyEntity(createResponseBody, role);

    const roleDataToUpdate: UpdateUserRole = {
      ...createRole(),
      version: createResponseBody.version,
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `api/platform/v1/roles/${createResponseBody.id}`,
      payload: {
        ...roleDataToUpdate,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });

    expect(updateResponse.statusCode).toEqual(200);

    const updateResponseBody = updateResponse.json<UserRoleWithoutPermission>();

    verifyEntity(updateResponseBody, roleDataToUpdate, ['version']);
  });

  it('should archive one, DELETE: api/platform/v1/roles/:id', async () => {
    const role = createRole();

    const createResponse = await app.inject({
      method: 'POST',
      url: 'api/platform/v1/roles',
      payload: role,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });
    const createResponseBody = createResponse.json<UserRoleWithoutPermission>();

    expect(createResponse.statusCode).toEqual(201);
    verifyEntity(createResponseBody, role);

    const findResponse = await app.inject({
      method: 'GET',
      url: `api/platform/v1/roles/${createResponseBody.id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });

    expect(findResponse.statusCode).toEqual(200);

    const findResponseBody = findResponse.json<UserRoleWithoutPermission>();

    expect(findResponseBody).toStrictEqual(createResponseBody);

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `api/platform/v1/roles/${createResponseBody.id}?version=${createResponseBody.version}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });

    expect(deleteResponse.statusCode).toEqual(204);

    const findResponseAfterDelete = await app.inject({
      method: 'GET',
      url: `api/platform/v1/roles/${createResponseBody.id}`,
      payload: role,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        [authConfig.headerTenantId]: currentTenant.id,
      },
    });

    expect(findResponseAfterDelete.statusCode).toEqual(404);
  });
});
