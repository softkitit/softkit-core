import { OmitType } from '@nestjs/swagger';
import { CustomUserRole } from '../../../database/entities';

export class CustomUserRoleWithoutPermissionsDto extends OmitType(
  CustomUserRole,
  ['tenant', 'tenantId', 'permissions', '__entity', 'deletedAt'] as const,
) {}
