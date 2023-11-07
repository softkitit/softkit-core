import { PickType } from '@nestjs/swagger';
import { BaseTransformEntity } from './base-transform.entity';
import { ChildCopyEntity } from './child/child-copy.entity';
import { Expose, Type } from 'class-transformer';

export class TransformWithChildArrayEntity extends PickType(
  BaseTransformEntity,
  ['id', 'name'],
) {
  @Expose()
  @Type(() => ChildCopyEntity)
  childArr!: ChildCopyEntity[];
}
