import { SetMetadata } from '@nestjs/common';

export const Roles = <T>(roles: T | T[]) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return SetMetadata('roles', [rolesArray]);
};
