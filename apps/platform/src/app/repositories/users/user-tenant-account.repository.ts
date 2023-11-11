import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserTenantAccount } from '../../database/entities';
import {
  BaseTenantRepository as BaseRepository,
  TenantClsStore,
} from '@softkit/typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserTenantAccountRepository extends BaseRepository<UserTenantAccount> {
  constructor(
    @InjectDataSource()
    ds: DataSource,
    clsService: ClsService<TenantClsStore>,
  ) {
    super(UserTenantAccount, ds, clsService);
  }

  public async hasAnyPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[],
  ): Promise<boolean> {
    return (
      this.getBaseUserTenantAccountSelectQueryBuilder(tenantId, userProfileId)
        .andWhere('LOWER(permission.action) IN (:...permissions)', {
          permissions,
        })
        .limit(1)
        // .cache(15 * 1000)
        .getCount()
        .then((count) => count > 0)
    );
  }

  public hasEachPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[],
  ): Promise<boolean> {
    let queryBuilder = this.getBaseUserTenantAccountSelectQueryBuilder(
      tenantId,
      userProfileId,
    );

    for (const permission of permissions) {
      queryBuilder = queryBuilder.andWhere(
        'LOWER(permission.action) = :permission',
        {
          permission,
        },
      );
    }
    return (
      queryBuilder
        .limit(1)
        // .cache(15 * 1000)
        .getCount()
        .then((count) => count > 0)
    );
  }

  private getBaseUserTenantAccountSelectQueryBuilder(
    tenantId: string,
    userProfileId: string,
  ) {
    return this.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .innerJoin('role.permissions', 'permission')
      .where('user.userProfileId = :userProfileId', { userProfileId })
      .andWhere('user.tenantId = :tenantId', { tenantId });
  }
}
