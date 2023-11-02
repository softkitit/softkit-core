import { PickType } from '@nestjs/swagger';
import { BaseTransformEntity } from './base-transform.entity';

export class WithPasswordFieldEntity extends PickType(BaseTransformEntity, [
  'password',
]) {}
