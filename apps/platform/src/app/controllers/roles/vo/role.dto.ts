import { OmitType } from '@nestjs/swagger';
import { CustomUserRole } from '../../../database/entities';
import {
  DefaultSortTransformAndApi,
  PaginationQueryParams,
  Sort,
} from '@saas-buildkit/common-types';

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

export class RolePaginationQueryParams extends PaginationQueryParams {
  @DefaultSortTransformAndApi(['id'])
  override sort: Sort[] = [];
}
