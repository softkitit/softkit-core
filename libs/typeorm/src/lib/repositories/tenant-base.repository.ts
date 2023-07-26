import { BaseRepository } from './base.repository';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityTarget, FindOptionsWhere } from 'typeorm';
import { BaseTenantEntityHelper } from '../entities/tenant-entity-helper';

export abstract class BaseTenantRepository<
  ENTITY extends BaseTenantEntityHelper,
> extends BaseRepository<ENTITY> {
  protected constructor(
    et: EntityTarget<ENTITY>,
    dataSource: DataSource,
    private clsService: ClsService<{ tenantId: string }>,
  ) {
    super(et, dataSource);
  }

  protected override presetDefaultWhereOptions<
    T extends FindOptionsWhere<ENTITY> | undefined,
  >(currentOptions: T): T {
    return {
      // allow to override tenantId from user perspective
      tenantId: this.clsService.get().tenantId,
      ...currentOptions,
    };
  }
}
