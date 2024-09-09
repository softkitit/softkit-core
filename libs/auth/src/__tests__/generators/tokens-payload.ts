import {
  IAccessTokenPayloadWithTenantsInfo,
  IRefreshTokenPayload,
  PermissionsBaseJwtPayload,
  RoleBasedAccessTokenPayload,
  RolesBaseJwtPayload,
} from '../../lib/vo/payload';
import { faker } from '@faker-js/faker';
import { RoleType } from '../app/controllers/vo/role-type';

export function generateEmptyPermissionsPayload(): PermissionsBaseJwtPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
    permissions: [],
  };
}

export function generateEmptyRolesPayload(): RolesBaseJwtPayload<RoleType> {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
    roles: [],
  };
}

export function generateMultiTenantPayload(
  roleTypes: RoleType[],
  permissions: string[] = [],
): IAccessTokenPayloadWithTenantsInfo<RoleType> & PermissionsBaseJwtPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
    permissions,
    tenants: [
      {
        tenantId: faker.string.uuid(),
        roles: roleTypes.map((roleType) => ({
          roleId: faker.string.uuid(),
          roleType,
        })),
      },
    ],
  };
}

export function generateNoTenantPayload(
  roleTypes: RoleType[],
  permissions: string[] = [],
): RoleBasedAccessTokenPayload<RoleType> & PermissionsBaseJwtPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
    permissions,
    roles: roleTypes.map((roleType) => ({
      roleId: faker.string.uuid(),
      roleType,
    })),
  };
}

export function generateRefreshTokenPayload(): IRefreshTokenPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
  };
}
