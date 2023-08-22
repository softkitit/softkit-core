import { OmitType, PickType } from '@nestjs/swagger';
import { CustomUserRole } from '../../../database/entities';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';

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

export class WhereConditionsUpdateUserRole extends PickType(CustomUserRole, [
  'createdAt',
] as const) {}

export const ROLES_PAGINATION_CONFIG: PaginateConfig<CustomUserRole> = {
  defaultLimit: 50,
  maxLimit: 100,
  searchableColumns: ['name', 'roleType'],
  filterableColumns: {
    id: [FilterOperator.EQ, FilterOperator.IN],
    name: [FilterOperator.CONTAINS],
  },
  select: ['id', 'name', 'createdAt', 'updatedAt', 'roleType'],
  sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
  defaultSortBy: [
    ['createdAt', 'DESC'],
    ['id', 'DESC'],
  ],
};
