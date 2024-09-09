import { SetMetadata } from '@nestjs/common';

export enum RoleCheckMode {
  'EACH' = 'EACH',
  'ANY' = 'ANY',
}

export const Roles = <T>(
  roles: T | T[],
  roleCheckMode: RoleCheckMode = RoleCheckMode.ANY,
) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return SetMetadata('roles', [rolesArray, roleCheckMode]);
};
