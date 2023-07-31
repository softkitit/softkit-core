import { OmitType } from '@nestjs/swagger';
import { CustomUserRole } from '../../../database/entities';

export class CustomUserRoleWithoutPermissionsDto extends OmitType(
  CustomUserRole,
  ['tenant', 'tenantId', '__entity', 'deletedAt'] as const,
) {}

export class CreateUserRole extends OmitType(CustomUserRole, [
  'id',
  'tenant',
  'tenantId',
  '__entity',
  'deletedAt',
  'createdAt',
  'updatedAt',
  'version',
] as const) {}

export class UpdateUserRole extends OmitType(CustomUserRole, [
  'tenant',
  'permissions',
  'tenantId',
  '__entity',
  'deletedAt',
  'createdAt',
  'updatedAt',
] as const) {}
