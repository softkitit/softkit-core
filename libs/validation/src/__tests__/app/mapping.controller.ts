import { Controller, Get } from '@nestjs/common';
import { TransformWithCustomGetterEntity } from './vo/transform/transform-with-custom-getter.entity';
import { map } from '../../lib/mapping/entity-to-entity';
import { BASE_TRANSFORM_ENTITY } from './vo/transform/base-transform.entity';

@Controller('mapping')
export class MappingController {
  @Get('/with-exclusion')
  async getWithExclusion(): Promise<TransformWithCustomGetterEntity> {
    return map(BASE_TRANSFORM_ENTITY, TransformWithCustomGetterEntity);
  }
}
