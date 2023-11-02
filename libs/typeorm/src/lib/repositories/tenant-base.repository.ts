import { BaseRepository } from './base.repository';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityTarget, FindOptionsWhere } from 'typeorm';
import { BaseTenantEntityHelper } from '../entities/tenant-entity-helper';
import { TenantClsStore } from '../vo/tenant-base-cls-store';
import { GeneralInternalServerException } from '@softkit/exceptions';

export abstract class BaseTenantRepository<
  ENTITY extends BaseTenantEntityHelper,
> extends BaseRepository<ENTITY> {
  protected constructor(
    et: EntityTarget<ENTITY>,
    dataSource: DataSource,
    protected clsService: ClsService<TenantClsStore>,
  ) {
    super(et, dataSource);
  }

  protected override presetDefaultWhereOptions<
    T extends FindOptionsWhere<ENTITY> | undefined,
  >(currentOptions: T): T {
    const tenantId = this.clsService.get().tenantId;

    if (!tenantId) {
      throw new GeneralInternalServerException(
        `TenantId is not set for the required tenant id repository, it's either not set in the request
        or you are trying to use the repository outside of the request scope or someone trying to cheat`,
      );
    }

    return {
      // allow to override tenantId from user perspective
      tenantId: tenantId,
      ...currentOptions,
    };
  }
}
