import { ClsService } from 'nestjs-cls';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { BaseTypeormTrackedEntityRepository } from './base-typeorm-tracked-entity.repository';
import { BaseTenantEntityHelper } from '../entity/tenant-entity-helper';
import { TenantClsStore } from '@softkit/persistence-api';
import { ObjectType } from 'typeorm/common/ObjectType';

export abstract class BaseTypeormTenantedEntityRepository<
  ENTITY extends BaseTenantEntityHelper,
  ID extends keyof ENTITY,
  FIELDS_REQUIRED_FOR_UPDATE extends keyof ENTITY = ID,
  AUTO_GENERATED_FIELDS extends keyof ENTITY =
    | keyof BaseTenantEntityHelper
    | ID
    | 'tenantId',
> extends BaseTypeormTrackedEntityRepository<
  ENTITY,
  ID,
  FIELDS_REQUIRED_FOR_UPDATE,
  AUTO_GENERATED_FIELDS
> {
  protected constructor(
    et: ObjectType<ENTITY>,
    dataSource: DataSource,
    idFieldName: ID,
    protected clsService: ClsService<TenantClsStore>,
  ) {
    super(et, dataSource, idFieldName);
  }

  /**
   * todo: reimplement to use a preset decorator for this
   * */
  protected override presetWhereOptions(
    criteria: FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>>,
  ): FindOptionsWhere<ENTITY> | Array<FindOptionsWhere<ENTITY>> {
    const options = super.presetWhereOptions(criteria);

    const optionsArray = Array.isArray(options) ? options : [options];

    const clsStore = this.clsService.get();

    const tenantId = clsStore?.tenantId;

    if (!clsStore || !tenantId) {
      throw new GeneralInternalServerException(
        `TenantId is not set for the required tenant id repository, it's either not set in the request
        or you are trying to use the repository outside of the request scope or someone trying to cheat`,
      );
    }

    const result = optionsArray.map((option) => {
      return {
        // allow to override tenantId from user perspective
        tenantId: tenantId,
        ...option,
      };
    });

    return Array.isArray(criteria) ? result : result[0];
  }
}
