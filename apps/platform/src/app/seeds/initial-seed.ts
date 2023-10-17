import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { UserRepository } from '../repositories';
import { User } from '../database/entities';
import {
  PermissionService,
  TenantService,
  PermissionCategoryService,
  CustomUserRoleService,
} from '../services';
import { PlatformAppModule } from '../platform-app.module';
import { UserStatus } from '../database/entities/users/types/user-status.enum';
import { AuthType } from '../database/entities/users/types/auth-type.enum';
import { RoleType } from '../database/entities/roles/types/default-role.enum';
import { hashPassword } from '@softkit/crypto';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seeder');

async function seed() {
  const app = await bootstrapBaseWebApp(PlatformAppModule);

  const permissionService = app.get(PermissionService);
  const tenantService = app.get(TenantService);
  const userRepository = app.get(UserRepository);
  const permissionCategoryService = app.get(PermissionCategoryService);
  const roleService = app.get(CustomUserRoleService);

  const tenant = await tenantService.createOrUpdateEntity({
    tenantName: 'Softkit',
    tenantUrl: 'localhost:9999',
  });

  const permissionCategory =
    await permissionCategoryService.createOrUpdateEntity({
      name: 'Roles Management',
      description: 'Roles management for users',
      permissions: [],
    });

  const permission = await permissionService.createOrUpdateEntity({
    name: 'Read Roles',
    description: 'Ability to see roles',
    action: 'platform.roles.read',
    permissionCategoryId: permissionCategory.id,
  });

  const adminRole = await roleService.createOrUpdateEntity({
    name: 'Admin Role',
    description: 'Default not editable Admin Role, with all permissions',
    roleType: RoleType.ADMIN,
    permissions: [permission],
    tenantId: tenant.id,
  });

  const regularUserRole = await roleService.createOrUpdateEntity({
    name: 'Regular User Role',
    description: 'Default editable Regular User Role',
    roleType: RoleType.REGULAR_USER,
    permissions: [],
    tenantId: tenant.id,
  });

  const password = Math.random().toString(10).slice(-8);
  const hashedPassword = await hashPassword(password);

  const adminUser: Partial<User> = {
    email: 'john.doe-admin@softkit.dev',
    password: hashedPassword,
    firstName: 'John Admin',
    lastName: 'Doe',
    authType: AuthType.LOCAL,
    roles: [adminRole],
    status: UserStatus.ACTIVE,
    tenantId: tenant.id,
  };

  await userRepository.save(adminUser);

  const regularUser: Partial<User> = {
    email: 'john.doe-regular@softkit.dev',
    password: hashedPassword,
    firstName: 'John Regular',
    lastName: 'Doe',
    authType: AuthType.LOCAL,
    roles: [regularUserRole],
    status: UserStatus.ACTIVE,
    tenantId: tenant.id,
  };

  await userRepository.save(regularUser);

  await app.close();
}

seed()
  .then(() => {
    logger.log('Seeding completed');
  })
  .catch((error) => {
    if (error instanceof Error) {
      throw new Error(`Error while seeding: ${error.message}`);
    } else {
      logger.error(error);
      throw new Error('Error while seeding');
    }
  });
