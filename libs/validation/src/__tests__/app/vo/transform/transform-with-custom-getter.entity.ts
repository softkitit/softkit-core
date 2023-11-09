import { PickType } from '@nestjs/swagger';
import { BaseTransformEntity } from './base-transform.entity';
import { Exclude, Expose } from 'class-transformer';

export class TransformWithCustomGetterEntity extends PickType(
  BaseTransformEntity,
  ['id', 'name'],
) {
  @Exclude()
  override name!: string;

  @Expose()
  get customName(): string {
    return this.name;
  }
}
