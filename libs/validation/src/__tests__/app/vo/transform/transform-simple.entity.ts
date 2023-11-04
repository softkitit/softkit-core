import { PickType } from '@nestjs/swagger';
import { BaseTransformEntity } from './base-transform.entity';

export class TransformSimpleEntity extends PickType(BaseTransformEntity, [
  'id',
  'name',
]) {}
