import {
  IAccessTokenPayloadWithTenantsInfo,
  IRefreshTokenPayload,
  PermissionsBaseJwtPayload,
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

export function generateRefreshTokenPayload(): IRefreshTokenPayload {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
  };
}
