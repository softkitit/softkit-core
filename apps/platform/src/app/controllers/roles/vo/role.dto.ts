import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { CustomUserRole } from '../../../database/entities';
import {
  ConditionsArray,
  DefaultSortTransformAndSwaggerApi,
  PaginationQueryParams,
  Sort,
} from '@saas-buildkit/common-types';
import { whereConditionFromQueryParams } from '@saas-buildkit/common-types';
import { Transform } from 'class-transformer';
import { Allow, IS_DATE, isDateString } from 'class-validator';

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

export class RolePaginationQueryParams extends PaginationQueryParams<WhereConditionsUpdateUserRole> {
  @ApiProperty({
    description:
      'where conditions to be applied. If not provided, default value is []',
    required: false,
    type: String,
  })
  @Transform((value) => {
    return whereConditionFromQueryParams<WhereConditionsUpdateUserRole>(
      value,
      WhereConditionsUpdateUserRole,
      {
        createdAt: [
          {
            validator: isDateString,
            validatorName: IS_DATE,
            errorMessage: IS_DATE,
          },
        ],
      },
    );
  })
  @Allow()
  override where: ConditionsArray<WhereConditionsUpdateUserRole> = [];

  @DefaultSortTransformAndSwaggerApi<CustomUserRole>(['id', 'createdAt'])
  override sort: Sort[] = [];
}
