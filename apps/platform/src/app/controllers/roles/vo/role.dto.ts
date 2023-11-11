import { OmitType } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';
import {
  DEFAULT_CREATE_ENTITY_EXCLUDE_LIST,
  DEFAULT_ENTITY_EXCLUDE_LIST,
  DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST,
} from '@softkit/typeorm';

export class UserRoleWithoutPermission extends OmitType(UserRole, [
  ...DEFAULT_ENTITY_EXCLUDE_LIST,
  'permissions',
  'tenant',
] as const) {}

export class CreateUserRole extends OmitType(UserRole, [
  ...DEFAULT_CREATE_ENTITY_EXCLUDE_LIST,
  'roleType',
  'tenant',
  'permissions',
  'tenantId',
] as const) {}

export class UpdateUserRole extends OmitType(UserRole, [
  ...DEFAULT_UPDATE_ENTITY_EXCLUDE_LIST,
  'roleType',
  'permissions',
  'tenantId',
] as const) {}

export const ROLES_PAGINATION_CONFIG: PaginateConfig<UserRole> = {
  defaultLimit: 50,
  maxLimit: 100,
  searchableColumns: ['name', 'roleType'],
  filterableColumns: {
    id: [FilterOperator.EQ, FilterOperator.IN],
    name: [FilterOperator.CONTAINS],
  },
  sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
  defaultSortBy: [
    ['createdAt', 'DESC'],
    ['id', 'DESC'],
  ],
};
