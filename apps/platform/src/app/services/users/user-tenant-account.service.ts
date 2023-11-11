import { Injectable } from '@nestjs/common';
import { UserTenantAccount } from '../../database/entities';
import { UserTenantAccountRepository } from '../../repositories';
import { BaseEntityService as BaseService } from '@softkit/typeorm-service';

@Injectable()
export class UserTenantAccountService extends BaseService<
  UserTenantAccount,
  UserTenantAccountRepository
> {
  constructor(repository: UserTenantAccountRepository) {
    super(repository);
  }

  public hasAnyPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[],
  ): Promise<boolean> {
    const normalizedPermissions = permissions.map((p) =>
      p.toLowerCase().trim(),
    );

    return this.repository.hasAnyPermission(
      tenantId,
      userProfileId,
      normalizedPermissions,
    );
  }

  public hasEachPermission(
    tenantId: string,
    userProfileId: string,
    permissions: string[],
  ): Promise<boolean> {
    const normalizedPermissions = permissions.map((p) =>
      p.toLowerCase().trim(),
    );

    return this.repository.hasEachPermission(
      tenantId,
      userProfileId,
      normalizedPermissions,
    );
  }
}
