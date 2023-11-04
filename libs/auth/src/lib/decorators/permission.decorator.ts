import { SetMetadata } from '@nestjs/common';

export type PresenceType = 'OWN' | 'ALL' | 'GROUP' | string;

export enum PermissionCheckMode {
  'EACH' = 'EACH',
  'ANY' = 'ANY',
}

export const Permissions = (
  permissions: string | string[],
  presence: PresenceType = 'ALL',
  checkMode: PermissionCheckMode = PermissionCheckMode.ANY,
) => {
  const permissionsArray = Array.isArray(permissions)
    ? permissions
    : [permissions];
  return SetMetadata('permissions', [permissionsArray, checkMode, presence]);
};
