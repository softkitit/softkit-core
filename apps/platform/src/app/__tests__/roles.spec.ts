import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { fileLoader } from 'nest-typed-config';
import * as path from 'node:path';
import { CustomUserRoleWithoutPermissionsDto } from '../controllers/roles/vo/role.dto';
import { CustomUserRole, Tenant, User } from '../database/entities';
import { RoleType } from '../database/entities/roles/types/default-role.enum';
import { AuthType } from '../database/entities/users/types/auth-type.enum';
import { UserStatus } from '../database/entities/users/types/user-status.enum';
import { PlatformAppModule } from '../platform-app.module';
import { UserRepository } from '../repositories';
import { CustomUserRoleService, TenantService } from '../services';
import { DbConfig } from '@saas-buildkit/typeorm';
import { bootstrapBaseWebApp } from '@saas-buildkit/bootstrap';
import { TokenService } from '@saas-buildkit/auth';
import { startDb } from '@saas-buildkit/test-utils';
import { PaginatedDocumented } from '@saas-buildkit/common-types';

describe('roles e2e test', () => {
  let app: NestFastifyApplication;
  let rolesService: CustomUserRoleService;
  let accessToken: string;
  let tenant: Tenant;
  let dbOptions: Partial<DbConfig>;

  const user: Partial<User> = {
    email: faker.internet.email(),
    password: '12345Aa!',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    authType: AuthType.LOCAL,
    roles: [],
    status: UserStatus.ACTIVE,
  };

  beforeAll(async () => {
    const { typeormOptions } = await startDb();
    dbOptions = typeormOptions as Partial<DbConfig>;
  });

  beforeEach(async () => {
    user.email = faker.internet.email({
      provider: 'gmail' + faker.string.alphanumeric(10).toString() + '.com',
    });

    const fileData = await fileLoader({
      absolutePath: path.join(__dirname, '../assets/.env.yaml'),
      basename: '.env.yaml',
      ignoreEnvironmentVariableSubstitution: false,
    })();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(DbConfig)
      .useValue({
        ...new DbConfig(),
        ...fileData.db,
        ...dbOptions,
        migrations: [path.join(__dirname, '../database/migrations/*.ts')],
      })
      .compile();

    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

    rolesService = app.get(CustomUserRoleService);
    const tokenService = app.get(TokenService);
    const tenantService = app.get(TenantService);
    const userRepository = app.get(UserRepository);

    tenant = await tenantService.createOrUpdateEntity({
      tenantName: faker.company.name(),
      tenantUrl: faker.internet.url(),
    });

    const createdUser = await userRepository.save({
      ...user,
      tenantId: tenant.id,
    });

    const token = await tokenService.signTokens({
      permissions: ['platform.roles.read'],
      sub: createdUser.id,
      tenantId: tenant.id,
      email: createdUser.email,
      roles: [],
    });

    accessToken = token.accessToken;
  });

  afterEach(async () => {
    await app.flushLogs();
    await app.close();
  });

  describe('find roles test', () => {
    it.skip('find all roles for tenant', async () => {
      const role = await rolesService.createOrUpdateEntity({
        name: faker.string.alpha(20),
        description: faker.string.alpha(200),
        roleType: RoleType.ADMIN,
        tenantId: tenant.id,
        permissions: [],
      } as any as CustomUserRole);

      const response = await app.inject({
        method: 'GET',
        url: `api/platform/v1/roles`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toEqual(200);

      const responseBody: PaginatedDocumented<CustomUserRoleWithoutPermissionsDto> =
        response.json();

      expect(responseBody.data.length).toEqual(1);
      const dto = responseBody.data[0];

      expect(dto.id).toEqual(role.id);
      expect(dto.name).toEqual(role.name);
      expect(dto.description).toEqual(role.description);
      expect(dto.version).toEqual(role.version);
      expect(dto.createdAt).toEqual(role.createdAt.toISOString());
      expect(dto.updatedAt).toEqual(role.updatedAt.toISOString());
    });
  });
});
